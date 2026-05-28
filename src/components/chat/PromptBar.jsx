import { useState } from 'react';
import { Paperclip, Mic, Send } from 'lucide-react';
import IconButton from '../ui/IconButton';
import { useChatStore } from '../../store/chatStore';
import { useAiStore } from '../../store/aiStore';
import { soundService } from '../../services/soundService';

export default function PromptBar() {
  const [value, setValue] = useState('');
  const addMessage = useChatStore((s) => s.addMessage);
  const activeChatId = useChatStore((s) => s.activeChatId);
  const isGenerating = useAiStore((s) => s.isGenerating);

  const handleSend = () => {
    if (!value.trim() || isGenerating) return;
    soundService.playConfirm();
    addMessage(activeChatId, value.trim());
    setValue('');
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-4 pb-6 pt-8 md:px-6 md:pb-8">
      <div
        className={[
          "pointer-events-auto w-full max-w-3xl rounded-2xl border border-jarvis-border/20 jarvis-glass transition-all duration-200 focus-within:border-jarvis-border/30",
          isGenerating ? "opacity-70 grayscale-[0.5]" : ""
        ].join(' ')}
      >
        <div className="flex items-center gap-1 px-2 py-2 sm:gap-2 sm:px-3">
          <IconButton icon={Paperclip} label="Upload file" size="md" disabled={isGenerating} />

          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isGenerating ? "JARVIS is processing..." : "Write your prompt here..."}
            disabled={isGenerating}
            className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-[15px] text-jarvis-text placeholder:text-jarvis-muted/60 focus:outline-none disabled:cursor-not-allowed"
          />

          <div className="flex shrink-0 items-center gap-0.5">
            <IconButton icon={Mic} label="Voice input" size="md" disabled={isGenerating} />
            <IconButton
              icon={Send}
              label="Send message"
              variant="primary"
              size="md"
              onClick={handleSend}
              disabled={isGenerating || !value.trim()}
              className="!rounded-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

