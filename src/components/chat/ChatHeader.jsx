import { Menu, Plus } from 'lucide-react';
import IconButton from '../ui/IconButton';
import { useChatStore } from '../../store/chatStore';

export default function ChatHeader({ title, onMenuClick }) {
  const createNewChat = useChatStore((s) => s.createNewChat);

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-jarvis-border px-4 py-3 md:px-6">
      <div className="flex items-center gap-3">
        <IconButton
          icon={Menu}
          label="Open menu"
          onClick={onMenuClick}
          className="md:hidden"
          size="md"
        />
        {title ? (
          <h1 className="truncate text-sm font-medium text-jarvis-text">{title}</h1>
        ) : (
          <span className="text-sm text-jarvis-muted md:hidden">Jarvis</span>
        )}
      </div>

      <IconButton
        icon={Plus}
        label="New Chat"
        onClick={() => createNewChat()}
        size="md"
        variant="ghost"
      />
    </header>
  );
}
