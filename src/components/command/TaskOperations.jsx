import { ChevronDown, ChevronRight } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';

function SummaryBlock({ title, stats }) {
  return (
    <div className="rounded-xl border border-jarvis-border/80 bg-jarvis-bg/40 p-4">
      <h3 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-jarvis-muted">
        {title}
      </h3>
      <ul className="flex flex-col gap-2">
        {stats.map((stat) => (
          <li key={stat.label} className="flex items-center justify-between gap-2 text-sm">
            <span className="text-jarvis-muted">{stat.label}</span>
            <span className="font-medium tabular-nums text-jarvis-text">{stat.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function TaskOperations({ summaries }) {
  const sectionKey = 'command:tasks';
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
          Task Operations
          {sectionExpanded ? (
            <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>
      </div>

      <div
        className={[
          'grid transition-all duration-200 ease-out',
          sectionExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        ].join(' ')}
      >
        <div className="overflow-hidden">
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryBlock
              title="Today Tasks"
              stats={[
                { label: 'Pending', value: summaries.today.pending },
                { label: 'Completed', value: summaries.today.completed },
                { label: 'Overdue', value: summaries.today.overdue },
              ]}
            />
            <SummaryBlock
              title="Weekly Tasks"
              stats={[
                { label: 'Active', value: summaries.weekly.active },
                { label: 'Completed', value: summaries.weekly.completed },
              ]}
            />
            <SummaryBlock
              title="Monthly Tasks"
              stats={[
                {
                  label: 'Milestones Remaining',
                  value: summaries.monthly.milestonesRemaining,
                },
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
