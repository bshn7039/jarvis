import { Minus, Plus, RotateCcw } from 'lucide-react';
import IconButton from '../ui/IconButton';

export default function ZoomControls({ zoom, onZoomIn, onZoomOut, onReset }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="hidden min-w-[4.5rem] text-xs text-jarvis-muted sm:inline">
        Zoom: {zoom}%
      </span>
      <IconButton icon={Minus} label="Zoom out" onClick={onZoomOut} size="sm" />
      <IconButton icon={Plus} label="Zoom in" onClick={onZoomIn} size="sm" />
      <IconButton icon={RotateCcw} label="Reset view" onClick={onReset} size="sm" />
    </div>
  );
}
