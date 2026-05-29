import { useState, useRef, useEffect } from 'react';
import { Paperclip, Mic, Send } from 'lucide-react';
import IconButton from '../ui/IconButton';
import { useChatStore } from '../../store/chatStore';
import { useAiStore } from '../../store/aiStore';
import { soundService } from '../../services/soundService';

export default function PromptBar() {
  const [value, setValue] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isListening, setIsListening] = useState(false);
  
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const isProgrammaticStopRef = useRef(false);
  const isSendingRef = useRef(false);
  // Each call to startListening gets a unique session ID so that stale
  // rec.onend callbacks from a previous session cannot restart recognition.
  const sessionIdRef = useRef(0);
  // Set to true when the user manually types in the box so we stop overwriting
  // the field with voice transcripts until they clear or send.
  const userIsTypingRef = useRef(false);

  // NOTE: Do NOT destructure addMessage into a local variable for use inside
  // voice callbacks — it would become a stale closure. Always call via getState().
  const activeChatId = useChatStore((s) => s.activeChatId);
  const isGenerating = useAiStore((s) => s.isGenerating);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const safeStartMic = () => {
    const activeGenerating = useAiStore.getState().isGenerating;
    if (isListeningRef.current && recognitionRef.current && !activeGenerating && !window.jarvis_is_speaking) {
      isProgrammaticStopRef.current = false;
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn("[Speech] safeStartMic failed:", err);
      }
    }
  };

  // Temporarily stop microphone listening while AI is generating to prevent feedback
  useEffect(() => {
    if (isGenerating && isListeningRef.current && recognitionRef.current) {
      isProgrammaticStopRef.current = true;
      try {
        recognitionRef.current.stop();
      } catch {}
    } else if (!isGenerating && isListeningRef.current && recognitionRef.current) {
      setTimeout(safeStartMic, 1000); // 1s cooldown after generation is complete
    }
  }, [isGenerating]);

  // Pause speech recognition while JARVIS is speaking to prevent loopback transcription
  useEffect(() => {
    const handleSpeakingStart = () => {
      if (isListeningRef.current && recognitionRef.current) {
        isProgrammaticStopRef.current = true;
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };

    const handleSpeakingStop = () => {
      // 250ms cooldown — with headphones there is no loopback, so we can
      // bring the mic back very quickly so the next utterance isn't missed.
      setTimeout(safeStartMic, 250);
    };

    window.addEventListener('jarvis-speaking-start', handleSpeakingStart);
    window.addEventListener('jarvis-speaking-stop', handleSpeakingStop);

    return () => {
      window.removeEventListener('jarvis-speaking-start', handleSpeakingStart);
      window.removeEventListener('jarvis-speaking-stop', handleSpeakingStop);
    };
  }, []);

  const handleSend = () => {
    if ((!value.trim() && attachedFiles.length === 0) || isGenerating) return;
    soundService.playConfirm();
    
    let finalPrompt = value.trim();
    if (attachedFiles.length > 0) {
      const filePayloads = attachedFiles.map(f => {
        const isBase64 = f.content.startsWith('data:');
        const contentPreview = isBase64 
          ? `[Binary/Image/PDF Data Base64 encoded: ${f.content.slice(0, 100)}...]` 
          : f.content;
        return `\n\n--- ATTACHED FILE: ${f.name} ---\n${contentPreview}\n-----------------------------`;
      }).join('');
      
      if (!finalPrompt) {
        finalPrompt = `Please analyze the attached files: ${attachedFiles.map(f => f.name).join(', ')}.`;
      }
      finalPrompt += filePayloads;
    }

    userIsTypingRef.current = false; // reset so voice can resume populating after send
    useChatStore.getState().addMessage(activeChatId, finalPrompt);
    setValue('');
    setAttachedFiles([]);
  };

  // ── File Attachments ───────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      const isText = file.type.startsWith('text/') || 
                     /\.(txt|js|jsx|ts|tsx|json|csv|md|css|html|py|go|sh|yml|yaml)$/i.test(file.name);
      
      reader.onload = (event) => {
        const content = event.target.result;
        setAttachedFiles(prev => [...prev, {
          name: file.name,
          size: file.size,
          type: file.type,
          content: content
        }]);
      };

      if (isText) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file); // Data URL for images / PDFs
      }
    });

    e.target.value = ''; // Reset to allow re-uploading same file
  };

  const removeFile = (idx) => {
    soundService.playClick();
    setAttachedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  // ── Web Speech API (Voice Mode) ────────────────────────────────────────────
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    // Bump session counter so any stale onend from the previous rec knows to bail
    const mySessionId = ++sessionIdRef.current;

    soundService.playConfirm();
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true;
    };

    rec.onresult = (event) => {
      // If JARVIS is currently speaking/playing audio or we are already sending, ignore all speech recognition results
      if (isSendingRef.current || window.jarvis_is_speaking || (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking)) {
        return;
      }

      let interimTranscript = '';
      let finalTranscript = '';
      let isLatestFinal = false;

      // Accumulate across the entire results list to handle pauses and split-sentence result blocks
      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
          if (i === event.results.length - 1) {
            isLatestFinal = true;
          }
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const fullSpeech = (finalTranscript + interimTranscript).trim();
      if (fullSpeech) {
        // Only overwrite the input value if the user hasn't manually typed
        // something themselves — this prevents voice from clobbering edits.
        if (!userIsTypingRef.current) {
          setValue(fullSpeech);
        }

        // Wake-word matching and auto-sending should ONLY occur when the user has paused and Chrome has finalized the latest segment!
        // This ensures that if they say "Jarvis" in the middle of a sentence, it won't trigger until the entire sentence is completed and finalized.
        if (isLatestFinal) {
          const lowercase = fullSpeech.toLowerCase().replace(/[,.?!]+$/, '').trim();
          
          // Match Jarvis or common phonetic homophones/misinterpretations at the end of the text
          const wakeWords = ['jarvis', 'jarves', 'travis', 'java', 'charvis', 'job is', 'jar viz'];
          let matchedWakeWord = null;
          for (const word of wakeWords) {
            if (lowercase.endsWith(word)) {
              matchedWakeWord = word;
              break;
            }
          }

          if (matchedWakeWord) {
            const wakeWordIndex = lowercase.lastIndexOf(matchedWakeWord);
            const commandText = fullSpeech.slice(0, wakeWordIndex).trim().replace(/[,.?!]+$/, '').trim();

            if (commandText.length >= 2) {
              // Synchronously lock sending to prevent duplicate triggers
              isSendingRef.current = true;

              // Stop recognition temporarily to prevent self-transcribing or audio feedback triggers
              isProgrammaticStopRef.current = true;
              rec.stop();
              
              soundService.playConfirm();
              const currentChatId = useChatStore.getState().activeChatId;
              // Always use getState() here — never a captured/stale addMessage closure
              userIsTypingRef.current = false; // reset so voice can resume after send
              useChatStore.getState().addMessage(currentChatId, commandText);
              setValue('');

              // Restart recognition — 400ms is enough to prevent the command text
              // from being immediately re-transcribed, but short enough that the
              // user can start their next utterance without a noticeable gap.
              setTimeout(() => {
                isSendingRef.current = false; // Reset lock
                if (isListeningRef.current) {
                  isProgrammaticStopRef.current = false;
                  try { rec.start(); } catch {}
                }
              }, 400);
            }
          }
        }
      }

      // If voice produced nothing (silence/pause), only clear the field when
      // the user hasn't typed something manually — prevents mid-edit blanking.
      if (!fullSpeech && !userIsTypingRef.current) {
        setValue('');
      }
    };

    rec.onend = () => {
      // Guard: if this session is no longer the active one (e.g. user toggled voice
      // off then back on quickly), bail out so the ghost rec doesn't restart itself
      // and create a duplicate recognition loop that writes to a new chat.
      if (mySessionId !== sessionIdRef.current) {
        return;
      }

      // If programmatic stop was triggered, do NOT restart immediately here (the setTimeout will handle it)
      if (isProgrammaticStopRef.current) {
        return;
      }
      
      // If listening is still toggled ON in state, restart immediately to be ALWAYS ACTIVE
      if (isListeningRef.current) {
        try {
          rec.start();
        } catch (err) {
          console.warn("[Speech] Auto-restart failed:", err);
        }
      }
    };

    rec.onerror = (e) => {
      console.warn("[Speech] Error:", e.error);
      if (e.error === 'not-allowed') {
        alert("Microphone permission was denied. Please allow microphone access in Chrome settings.");
        stopListening();
      }
    };

    recognitionRef.current = rec;
    rec.start();
  };

  const stopListening = () => {
    soundService.playConfirm();
    setIsListening(false);
    isListeningRef.current = false;
    isSendingRef.current = false; // Reset lock
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-4 pb-6 pt-8 md:px-6 md:pb-8">
      <div
        className={[
          "pointer-events-auto w-full max-w-3xl rounded-2xl border border-jarvis-border/20 jarvis-glass transition-all duration-200 focus-within:border-jarvis-border/30",
          isGenerating ? "opacity-70 grayscale-[0.5]" : ""
        ].join(' ')}
      >
        {/* Horizontal Attachment list */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-jarvis-border/10 bg-white/5 rounded-t-2xl">
            {attachedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 rounded-xl border border-jarvis-border/30 bg-black/50 px-3 py-1.5 text-xs text-jarvis-text shadow-sm">
                <span className="truncate max-w-[150px] font-medium" title={file.name}>
                  {file.name}
                </span>
                <span className="text-[10px] text-jarvis-muted">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="ml-1 text-jarvis-muted hover:text-red-400 font-bold transition-colors cursor-pointer text-sm"
                  title="Remove attachment"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 px-2 py-2 sm:gap-2 sm:px-3">
          <IconButton 
            icon={Paperclip} 
            label="Upload files" 
            size="md" 
            disabled={isGenerating} 
            onClick={() => fileInputRef.current?.click()}
          />
          <input
            type="file"
            ref={fileInputRef}
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          <input
            type="text"
            value={value}
            onChange={(e) => {
              // Mark that the user is manually editing so voice doesn't clobber their changes
              userIsTypingRef.current = e.target.value.length > 0;
              setValue(e.target.value);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
              isListening 
                ? "Listening... Speak 'Jarvis' to auto-send command..." 
                : isGenerating 
                ? "JARVIS is processing..." 
                : "Write your prompt here..."
            }
            disabled={isGenerating}
            className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-[15px] text-jarvis-text placeholder:text-jarvis-muted/60 focus:outline-none disabled:cursor-not-allowed"
          />

          <div className="flex shrink-0 items-center gap-0.5">
            <IconButton 
              icon={Mic} 
              label={isListening ? "Stop listening" : "Voice input"} 
              size="md" 
              disabled={isGenerating} 
              onClick={toggleListening}
              className={isListening ? "!text-red-400 !bg-red-500/10 border border-red-500/30 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.2)]" : ""}
            />
            <IconButton
              icon={Send}
              label="Send message"
              variant="primary"
              size="md"
              onClick={handleSend}
              disabled={isGenerating || (!value.trim() && attachedFiles.length === 0)}
              className="!rounded-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

