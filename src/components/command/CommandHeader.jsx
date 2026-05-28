import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import IconButton from '../ui/IconButton';

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export default function CommandHeader({ onMenuClick }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-jarvis-border/20 jarvis-glass px-4 py-5 md:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <IconButton
          icon={Menu}
          label="Open menu"
          onClick={onMenuClick}
          className="md:hidden"
          size="md"
        />
        <div>
          <h1 className="text-xl font-medium tracking-tight text-jarvis-text md:text-2xl">
            Command Center
          </h1>
          <p className="mt-1 text-sm text-jarvis-muted">Operational Dashboard</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-right">
        <div className="hidden sm:block">
          <p className="text-xs text-jarvis-muted">{formatDate(now)}</p>
          <p className="mt-1 font-mono text-sm tabular-nums text-jarvis-text">
            {formatTime(now)}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-jarvis-border bg-jarvis-panel px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-jarvis-accent/80 shadow-[0_0_8px_rgba(125,211,252,0.4)]" />
          <span className="text-xs text-jarvis-muted">Live</span>
        </div>
      </div>
    </header>
  );
}
