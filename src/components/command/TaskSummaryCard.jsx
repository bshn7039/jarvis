import { ArrowRight, ChevronDown, ChevronRight } from 'lucide-react';
import { categoryStyles } from '../../data/mockCommandData';
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

export default function TaskSummaryCard({ summaries, highlights }) {
  const sectionKey = 'command:tasks';
  const sectionExpanded = useUiStore(
    (s) => s.commandCenter.collapsedSections[sectionKey] ?? true,
  );
  const toggleCommandExpanded = useUiStore((s) => s.toggleCommandExpanded);

  return (
    <section className="rounded-2xl border border-jarvis-border bg-jarvis-panel p-5 md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
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
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-jarvis-border px-3 py-1.5 text-xs text-jarvis-muted transition-colors duration-200 hover:border-jarvis-muted/40 hover:text-jarvis-text"
        >
          Open Tasks
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </div>

      <div
        className={[
          'grid transition-all duration-200 ease-out',
          sectionExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        ].join(' ')}
      >
        <div className="overflow-hidden">
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
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

          <div>
            <h3 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-jarvis-muted/80">
              Priority Signals
            </h3>
            <div className="flex flex-wrap gap-2">
              {highlights.map((item) => (
                <span
                  key={item.id}
                  className={[
                    'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs',
                    categoryStyles[item.category] ?? categoryStyles.System,
                  ].join(' ')}
                >
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
