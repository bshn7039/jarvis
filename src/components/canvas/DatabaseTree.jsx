import { memo, useMemo } from 'react';
import { ChevronDown, ChevronRight, Database, FileText } from 'lucide-react';
import VisibilityCheckbox from '../ui/VisibilityCheckbox';
import { useUiStore } from '../../store/uiStore';
import { useCombinedState } from '../../hooks/useCombinedState';
import { getNestedData, formatValue } from './DatabaseNode';

const MAX_DEPTH = 10;

const TreeNode = memo(function TreeNode({ node, depth = 0, onToggleCheck, onToggleExpand, combinedState }) {
  const isExpanded = useUiStore((s) => !!s.explorerExpansion[node.id]);
  const isChecked = useUiStore((s) => s.treeChecked[node.id] !== false);

  const hasChildren = node.children?.length > 0;
  const Icon = hasChildren ? Database : FileText;

  const data = useMemo(() => {
    if (!hasChildren && node.dataKey) {
      return getNestedData(combinedState, node.dataKey);
    }
    return null;
  }, [hasChildren, node.dataKey, combinedState]);

  if (depth > MAX_DEPTH) return null;

  const isPrimitive = data !== null && typeof data !== 'object';

  return (
    <div role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined}>
      <div
        className="group flex w-full items-center gap-1.5 rounded-lg py-1.5 pr-2 transition-all duration-200 hover:bg-white/[0.03]"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggleExpand(node.id)}
            className="shrink-0 rounded p-0.5 text-jarvis-muted transition-colors duration-200 hover:bg-white/10 hover:text-jarvis-text"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
            )}
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Icon className={`h-3.5 w-3.5 shrink-0 ${isExpanded ? 'text-jarvis-text' : 'text-jarvis-muted'}`} strokeWidth={1.5} />
          <div className="flex flex-1 items-baseline gap-1.5 min-w-0">
            <span className={`truncate text-[13px] ${node.isModule ? 'font-semibold tracking-tight text-jarvis-text' : 'text-jarvis-muted group-hover:text-jarvis-text'}`}>
              {node.label}
            </span>
            {isPrimitive && (
              <span className="truncate text-[11px] text-jarvis-muted/60 font-normal">
                : {formatValue(data, node.label)}
              </span>
            )}
          </div>
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <VisibilityCheckbox
            checked={isChecked}
            onToggle={() => onToggleCheck(node.id)}
            label={isChecked ? `Hide ${node.label}` : `Show ${node.label}`}
          />
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="flex flex-col" role="group">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onToggleCheck={onToggleCheck}
              onToggleExpand={onToggleExpand}
              combinedState={combinedState}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default function DatabaseTree({ tree, onToggleCheck, onToggleExpand }) {
  const combinedState = useCombinedState();

  if (!Array.isArray(tree) || tree.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Database className="h-10 w-10 text-jarvis-muted/20 mb-3" />
        <p className="text-xs text-jarvis-muted italic">No database modules found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5" role="tree">
      {tree.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          depth={0}
          onToggleCheck={onToggleCheck}
          onToggleExpand={onToggleExpand}
          combinedState={combinedState}
        />
      ))}
    </div>
  );
}
