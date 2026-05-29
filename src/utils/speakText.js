let currentAudio = null;

export async function speakText(text) {
  // 1. Cancel currently playing speech and un-pause if stuck
  if (typeof window !== 'undefined') {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }
  }
  
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio = null;
    } catch {}
  }

  if (!text) return;

  const isSpeakOn = localStorage.getItem('jarvis_speak_replies') !== 'false';
  if (!isSpeakOn) return;

  const engine = localStorage.getItem('jarvis_speak_engine') || 'elevenlabs';

  try {
    // Strip markdown formatting, emojis, or code blocks for clean speaking
    const cleanText = text
      .replace(/```[\s\S]*?```/g, '') // remove code blocks
      .replace(/`([^`]+)`/g, '$1')     // remove inline code formatting
      .replace(/[*#_~]/g, '')          // remove bold/italic markdown characters
      .replace(/ctx:\S+/g, '')         // remove context chips tags
      .replace(/Proposed System Action[\s\S]*$/, '') // strip proposed action pre logs if any
      .replace(/[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F000}-\u{1FAF8}\u{1F900}-\u{1F9FF}]/gu, '') // remove emojis
      .trim();

    if (!cleanText) return;

    const { elevenlabsService } = await import('../services/elevenlabsService');
    const result = await elevenlabsService.textToSpeech(cleanText, null, engine === 'browser');
    
    if (result.source === 'elevenlabs' && result.audioUrl) {
      const audio = new Audio(result.audioUrl);
      currentAudio = audio;
      if (typeof window !== 'undefined') {
        window.jarvis_is_speaking = true;
        window.dispatchEvent(new CustomEvent('jarvis-speaking-start'));
      }
      audio.onended = () => {
        if (typeof window !== 'undefined') {
          window.jarvis_is_speaking = false;
          window.dispatchEvent(new CustomEvent('jarvis-speaking-stop'));
        }
      };
      audio.onerror = () => {
        if (typeof window !== 'undefined') {
          window.jarvis_is_speaking = false;
          window.dispatchEvent(new CustomEvent('jarvis-speaking-stop'));
        }
      };
      audio.play().catch(err => {
        if (typeof window !== 'undefined') {
          window.jarvis_is_speaking = false;
          window.dispatchEvent(new CustomEvent('jarvis-speaking-stop'));
        }
        console.warn('[TTS] Audio play failed:', err);
      });
    } else if (result.source === 'browser' && result.utterance) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.resume();
      }
      if (typeof window !== 'undefined') {
        window.jarvis_is_speaking = true;
        window.dispatchEvent(new CustomEvent('jarvis-speaking-start'));
      }
      result.utterance.onend = () => {
        if (typeof window !== 'undefined') {
          window.jarvis_is_speaking = false;
          window.dispatchEvent(new CustomEvent('jarvis-speaking-stop'));
        }
      };
      result.utterance.onerror = () => {
        if (typeof window !== 'undefined') {
          window.jarvis_is_speaking = false;
          window.dispatchEvent(new CustomEvent('jarvis-speaking-stop'));
        }
      };
      setTimeout(() => {
        try {
          window.speechSynthesis.resume();
          window.speechSynthesis.speak(result.utterance);
        } catch (e) {
          if (typeof window !== 'undefined') {
            window.jarvis_is_speaking = false;
            window.dispatchEvent(new CustomEvent('jarvis-speaking-stop'));
          }
          console.warn('[TTS] Browser speak failed:', e);
        }
      }, 50);
    }
  } catch (err) {
    if (typeof window !== 'undefined') {
      window.jarvis_is_speaking = false;
      window.dispatchEvent(new CustomEvent('jarvis-speaking-stop'));
    }
    console.warn('[TTS] speakText failed:', err);
  }
}
