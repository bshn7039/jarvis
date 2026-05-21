import { ChevronDown, ChevronRight } from 'lucide-react';
import VisibilityCheckbox from '../ui/VisibilityCheckbox';

function TreeNode({ node, depth = 0, onToggleCheck, onToggleExpand }) {
  const hasChildren = node.children?.length > 0;
  const expanded = node.expanded ?? false;

  return (
    <div role="treeitem" aria-expanded={hasChildren ? expanded : undefined}>
      <div
        className="flex w-full items-center gap-1.5 rounded-lg py-1 pr-1 transition-colors duration-200 hover:bg-white/[0.03]"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggleExpand(node.id)}
            className="shrink-0 rounded p-0.5 text-jarvis-muted transition-colors duration-200 hover:text-jarvis-text"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5 opacity-60" strokeWidth={1.75} />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 opacity-60" strokeWidth={1.75} />
            )}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <VisibilityCheckbox
          checked={node.checked}
          onToggle={() => onToggleCheck(node.id)}
          label={node.checked ? `Hide ${node.label}` : `Show ${node.label}`}
        />
        <span className="min-w-0 flex-1 truncate text-[13px] text-jarvis-muted">
          {node.label}
        </span>
      </div>

      {hasChildren && (
        <div
          className={[
            'grid transition-all duration-200 ease-out',
            expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
          ].join(' ')}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col" role="group">
              {node.children.map((child) => (
                <TreeNode
                  key={child.id}
                  node={child}
                  depth={depth + 1}
                  onToggleCheck={onToggleCheck}
                  onToggleExpand={onToggleExpand}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DatabaseTree({ tree, onToggleCheck, onToggleExpand }) {
  if (!Array.isArray(tree) || tree.length === 0) {
    return null;
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
        />
      ))}
    </div>
  );
}
