import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export default function SidebarToggle({ collapsed, onToggle, className = '' }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        'rounded-lg p-1.5 text-jarvis-muted transition-colors duration-200',
        'hover:bg-white/5 hover:text-jarvis-text',
        className,
      ].join(' ')}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      {collapsed ? (
        <PanelLeftOpen className="h-4 w-4" strokeWidth={1.75} />
      ) : (
        <PanelLeftClose className="h-4 w-4" strokeWidth={1.75} />
      )}
    </button>
  );
}
