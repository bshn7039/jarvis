import { memo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { filterVisibleDataNodes, isFieldVisible } from '../../utils/fieldVisibility';
import { useUiStore } from '../../store/uiStore';

const ModuleTreeNode = memo(function ModuleTreeNode({
  moduleId,
  node,
  visibilityMap,
  depth = 0,
}) {
  const hasChildren = node.children?.length > 0;
  const expanded = useUiStore((s) => s.isModuleFieldExpanded(moduleId, node.id));
  const toggleModuleFieldExpanded = useUiStore((s) => s.toggleModuleFieldExpanded);

  if (!isFieldVisible(node, visibilityMap)) {
    return null;
  }

  const paddingLeft = depth * 10;

  if (!hasChildren) {
    return (
      <div
        className="flex items-start gap-1.5 py-0.5"
        style={{ paddingLeft: `${paddingLeft + 18}px` }}
      >
        <span className="shrink-0 font-mono text-[11px] text-jarvis-muted/50">├</span>
        <div className="min-w-0 flex-1">
          <span className="font-mono text-[12px] text-jarvis-muted">{node.label}</span>
          {node.value !== undefined && (
            <span className="ml-2 text-[12px] text-jarvis-text/75">{node.value}</span>
          )}
        </div>
      </div>
    );
  }

  const visibleChildren = filterVisibleDataNodes(node.children, visibilityMap);
  if (visibleChildren.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <div
        className="flex items-center gap-1 rounded py-0.5 transition-colors duration-200 hover:bg-white/[0.02]"
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        <button
          type="button"
          onClick={() => toggleModuleFieldExpanded(moduleId, node.id)}
          className="module-no-drag shrink-0 rounded p-0.5 text-jarvis-muted transition-colors duration-200 hover:text-jarvis-text"
          aria-label={expanded ? 'Collapse section' : 'Expand section'}
        >
          {expanded ? (
            <ChevronDown className="h-3 w-3 opacity-60" strokeWidth={1.75} />
          ) : (
            <ChevronRight className="h-3 w-3 opacity-60" strokeWidth={1.75} />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <span className="text-[12px] font-medium text-jarvis-text/90">{node.label}</span>
          {node.value !== undefined && (
            <span className="ml-2 text-[12px] text-jarvis-muted">{node.value}</span>
          )}
        </div>
      </div>

      <div
        className={[
          'grid transition-all duration-200 ease-out',
          expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        ].join(' ')}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-0.5 pb-0.5">
            {visibleChildren.map((child) => (
              <ModuleTreeNode
                key={child.id ?? child.label}
                moduleId={moduleId}
                node={child}
                visibilityMap={visibilityMap}
                depth={depth + 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

function ModuleTree({ moduleId, nodes = [], visibilityMap = {} }) {
  const visibleNodes = filterVisibleDataNodes(nodes, visibilityMap);

  if (!visibleNodes.length) {
    return (
      <p className="text-[12px] text-jarvis-muted/60">No visible fields</p>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {visibleNodes.map((node) => (
        <ModuleTreeNode
          key={node.id ?? node.label}
          moduleId={moduleId}
          node={node}
          visibilityMap={visibilityMap}
          depth={0}
        />
      ))}
    </div>
  );
}

export default memo(ModuleTree);
