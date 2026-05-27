import { memo, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import VisibilityCheckbox from '../ui/VisibilityCheckbox';
import { useUiStore } from '../../store/uiStore';
import { useModuleData } from '../../hooks/useModuleData';
import DatabaseNode from './DatabaseNode';

const ModuleCard = memo(function ModuleCard({
  module,
  moduleNode,
  onVisibilityToggle,
  onDragIntent,
  onViewNode,
  onEditNode,
  onDeleteNode,
}) {
  const collapsed = module.collapsed;
  const toggleModuleCollapsed = useUiStore((s) => s.toggleModuleCollapsed);
  const moduleData = useModuleData(module.id);

  // For DatabaseNode, we provide the full combinedState only if necessary, 
  // but here we can pass the moduleData as the root state for this branch.
  const rootState = useMemo(() => ({
    [module.id]: moduleData
  }), [module.id, moduleData]);

  return (
    <div
      className={[
        'rounded-xl border border-jarvis-border bg-jarvis-panel shadow-[0_4px_24px_rgba(0,0,0,0.35)] transition-shadow duration-200',
        'hover:border-jarvis-muted/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.45)]',
      ].join(' ')}
    >
      <header
        className="module-drag-handle flex cursor-move items-center gap-2 border-b border-jarvis-border px-3 py-2.5 select-none active:cursor-grabbing"
        onPointerDown={(event) => {
          event.stopPropagation();
          onDragIntent?.();
        }}
      >
        <button
          type="button"
          onClick={() => toggleModuleCollapsed(module.id)}
          className="module-no-drag rounded p-0.5 text-jarvis-muted transition-colors duration-200 hover:bg-white/5 hover:text-jarvis-text"
          aria-label={collapsed ? 'Expand module' : 'Collapse module'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>
        <h3 className="min-w-0 flex-1 truncate text-sm font-medium text-jarvis-text">
          {module.title}
        </h3>
        <div className="module-no-drag">
          <VisibilityCheckbox
            checked={module.visible}
            onToggle={onVisibilityToggle}
            label={`Toggle ${module.title} visibility`}
          />
        </div>
      </header>

      <div
        className={[
          'module-no-drag overflow-hidden transition-all duration-200 ease-out',
          collapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100',
        ].join(' ')}
      >
        <div className="px-3 py-3">
          <div className="max-h-[800px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-jarvis-border">
            {moduleNode?.children?.length ? (
              <div className="flex flex-col gap-1">
                {moduleNode.children.map((node) => (
                  <DatabaseNode
                    key={node.id}
                    node={node}
                    combinedState={rootState}
                    onViewNode={onViewNode}
                    onEditNode={onEditNode}
                    onDeleteNode={onDeleteNode}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center opacity-50">
                <p className="text-[11px] text-jarvis-muted italic">No data layers visible.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default ModuleCard;
