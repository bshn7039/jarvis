import { useRef } from 'react';
import Draggable from 'react-draggable';
import ModuleCard from './ModuleCard';

export default function DraggableModule({
  module,
  scale = 1,
  onDragStart,
  onDragStop,
  onPositionChange,
  onVisibilityToggle,
}) {
  const nodeRef = useRef(null);

  const stopPropagation = (event) => {
    event.stopPropagation();
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".module-drag-handle"
      cancel=".module-no-drag"
      position={module.position}
      scale={scale}
      enableUserSelectHack={false}
      onMouseDown={stopPropagation}
      onStart={(event) => {
        stopPropagation(event);
        onDragStart?.();
      }}
      onDrag={(event, data) => {
        stopPropagation(event);
        onPositionChange(data.x, data.y);
      }}
      onStop={(event, data) => {
        stopPropagation(event);
        onDragStop?.();
        onPositionChange(data.x, data.y);
      }}
    >
      <div
        ref={nodeRef}
        className="module-card absolute z-10 w-[300px]"
        onPointerDownCapture={stopPropagation}
      >
        <ModuleCard
          module={module}
          onVisibilityToggle={onVisibilityToggle}
          onDragIntent={onDragStart}
        />
      </div>
    </Draggable>
  );
}
