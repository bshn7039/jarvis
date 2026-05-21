import { memo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';

const GoalTreeNode = memo(function GoalTreeNode({ node, depth = 0 }) {
  const expandKey = `goals:${node.id}`;
  const expanded = useUiStore((s) => s.command.expanded[expandKey] ?? depth < 1);
  const toggleCommandExpanded = useUiStore((s) => s.toggleCommandExpanded);
  const hasChildren = node.children?.length > 0;

  return (
    <div style={{ paddingLeft: `${depth * 14}px` }}>
      <div className="flex items-center gap-1.5 rounded-lg py-1.5 pr-2 transition-colors duration-200 hover:bg-white/[0.02]">
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
              {node.children.map((child) => (
                <GoalTreeNode key={child.id} node={child} depth={depth + 1} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default function GoalsHierarchy({ tree }) {
  const sectionKey = 'command:goals';
  const sectionExpanded = useUiStore((s) => s.command.expanded[sectionKey] ?? true);
  const toggleCommandExpanded = useUiStore((s) => s.toggleCommandExpanded);

  return (
    <section className="rounded-2xl border border-jarvis-border bg-jarvis-panel p-5 md:p-6">
      <button
        type="button"
        onClick={() => toggleCommandExpanded(sectionKey)}
        className="mb-4 flex w-full items-center justify-between gap-2 text-left"
      >
        <h2 className="text-sm font-medium uppercase tracking-wider text-jarvis-muted">
          Goals Hierarchy
        </h2>
        {sectionExpanded ? (
          <ChevronDown className="h-4 w-4 text-jarvis-muted" strokeWidth={1.75} />
        ) : (
          <ChevronRight className="h-4 w-4 text-jarvis-muted" strokeWidth={1.75} />
        )}
      </button>

      <div
        className={[
          'grid transition-all duration-200 ease-out',
          sectionExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        ].join(' ')}
      >
        <div className="overflow-hidden">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-jarvis-muted/70">
            Main Goal
          </p>
          <GoalTreeNode node={tree} depth={0} />
        </div>
      </div>
    </section>
  );
}
