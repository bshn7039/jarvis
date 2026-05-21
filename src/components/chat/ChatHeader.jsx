import { Menu } from 'lucide-react';
import IconButton from '../ui/IconButton';

export default function ChatHeader({ title, onMenuClick }) {
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-jarvis-border px-4 py-3 md:px-6">
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
    </header>
  );
}
