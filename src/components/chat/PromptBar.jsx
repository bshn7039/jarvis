import { useState } from 'react';
import { Paperclip, Mic, Send } from 'lucide-react';
import IconButton from '../ui/IconButton';
import { useChatStore } from '../../store/chatStore';

export default function PromptBar() {
  const [value, setValue] = useState('');
  const addMessage = useChatStore((s) => s.addMessage);
  const activeChatId = useChatStore((s) => s.activeChatId);

  const handleSend = () => {
    if (!value.trim()) return;
    addMessage(activeChatId, value.trim());
    setValue('');
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-4 pb-6 pt-8 md:px-6 md:pb-8">
      <div
        className="pointer-events-auto w-full max-w-3xl rounded-2xl border border-jarvis-border bg-jarvis-panel shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-shadow duration-200 focus-within:border-jarvis-border focus-within:shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-center gap-1 px-2 py-2 sm:gap-2 sm:px-3">
          <IconButton icon={Paperclip} label="Upload file" size="md" />

          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Write your prompt here..."
            className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-[15px] text-jarvis-text placeholder:text-jarvis-muted/60 focus:outline-none"
          />

          <div className="flex shrink-0 items-center gap-0.5">
            <IconButton icon={Mic} label="Voice input" size="md" />
            <IconButton
              icon={Send}
              label="Send message"
              variant="primary"
              size="md"
              onClick={handleSend}
              className="!rounded-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
