import { Menu } from 'lucide-react';
import IconButton from '../ui/IconButton';
import ZoomControls from './ZoomControls';

export default function CanvasToolbar({
  title = 'Canvas',
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
  onMenuClick,
}) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-4 border-b border-jarvis-border/20 jarvis-glass px-4 py-3 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <IconButton
          icon={Menu}
          label="Open menu"
          onClick={onMenuClick}
          className="md:hidden"
          size="md"
        />
        <h1 className="truncate text-sm font-medium text-jarvis-text">{title}</h1>
        <span className="text-xs text-jarvis-muted sm:hidden">Zoom: {zoom}%</span>
      </div>
      <ZoomControls
        zoom={zoom}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onReset={onReset}
      />
    </header>
  );
}
