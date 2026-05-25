import { memo, useRef } from 'react';
import Draggable from 'react-draggable';
import ModuleCard from './ModuleCard';

const DraggableModule = memo(function DraggableModule({
  module,
  moduleNode,
  scale = 1,
  onDragStart,
  onDragStop,
  onPositionChange,
  onVisibilityToggle,
  onViewNode,
  onEditNode,
  onDeleteNode,
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
          moduleNode={moduleNode}
          onVisibilityToggle={onVisibilityToggle}
          onDragIntent={onDragStart}
          onViewNode={onViewNode}
          onEditNode={onEditNode}
          onDeleteNode={onDeleteNode}
        />
      </div>
    </Draggable>
  );
});

export default DraggableModule;
