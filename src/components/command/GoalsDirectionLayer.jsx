import { memo } from 'react';
import { ChevronDown, ChevronRight, Target } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';

const GoalTreeNode = memo(function GoalTreeNode({ node, depth = 0 }) {
  if (!node || typeof node !== 'object') return null;
  const expandKey = `goals:${node.id}`;
  const expanded = useUiStore(
    (s) => s.commandCenter.collapsedSections[expandKey] ?? depth < 1,
  );
  const toggleCommandExpanded = useUiStore((s) => s.toggleCommandExpanded);
  const hasChildren = node.children?.length > 0;
  const isCompleted = node.completed;

  return (
    <div style={{ paddingLeft: `${depth * 14}px` }}>
      <div className={[
        "flex items-center gap-1.5 rounded-lg py-1.5 pr-2 transition-colors duration-200 hover:bg-white/[0.02]",
        isCompleted ? "opacity-40" : "opacity-100"
      ].join(' ')}>
        {hasChildren ? (
          <button
            type="button"
            onClick={() => toggleCommandExpanded(expandKey)}
            className="shrink-0 rounded p-0.5 text-jarvis-muted hover:text-jarvis-text"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5 opacity-60" strokeWidth={1.75} />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 opacity-60" strokeWidth={1.75} />
            )}
          </button>
        ) : (
          <span className="w-5 shrink-0 text-center text-[11px] text-jarvis-muted/50">→</span>
        )}
        <span
          className={[
            'text-sm',
            depth === 0 ? 'font-medium text-jarvis-text' : 'text-jarvis-text/85',
            isCompleted ? 'line-through' : ''
          ].join(' ')}
        >
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
            <div className="flex flex-col border-l border-jarvis-border/50 ml-2.5 pl-2">
              {node.children.filter(Boolean).map((child, index) => (
                <GoalTreeNode key={child.id || `goal-node-${depth + 1}-${index}`} node={child} depth={depth + 1} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default function GoalsDirectionLayer({ tree }) {
  const sectionKey = 'command:goals';
  const sectionExpanded = useUiStore(
    (s) => s.commandCenter.collapsedSections[sectionKey] ?? true,
  );
  const toggleCommandExpanded = useUiStore((s) => s.toggleCommandExpanded);

  return (
    <section className="rounded-2xl border border-jarvis-border bg-jarvis-panel p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => toggleCommandExpanded(sectionKey)}
          className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-jarvis-muted hover:text-jarvis-text"
        >
          Goals Direction Layer
          {sectionExpanded ? (
            <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>
        <Target className="h-4 w-4 text-jarvis-muted/40" />
      </div>

      <div
        className={[
          'grid transition-all duration-200 ease-out',
          sectionExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        ].join(' ')}
      >
        <div className="overflow-hidden">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-jarvis-muted/70">
            Strategic Roadmap
          </p>
          {tree ? (
            <GoalTreeNode node={tree} depth={0} />
          ) : (
            <p className="text-sm text-jarvis-muted">No strategic goals configured.</p>
          )}
        </div>
      </div>
    </section>
  );
}
