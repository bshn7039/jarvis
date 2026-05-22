import { ChevronDown, ChevronRight } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';

function CountTile({ label, value, max }) {
  const ratio = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="rounded-xl border border-jarvis-border/80 bg-jarvis-bg/40 p-4">
      <p className="text-[10px] uppercase tracking-wider text-jarvis-muted">{label}</p>
      <p className="mt-2 text-2xl font-medium tabular-nums text-jarvis-text">{value}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded bg-white/10">
        <div className="h-full bg-white/40 transition-all" style={{ width: `${ratio}%` }} />
      </div>
    </div>
  );
}

export default function TaskOperations({ summaries }) {
  const sectionKey = 'command:tasks';
  const sectionExpanded = useUiStore((s) => s.commandCenter.collapsedSections[sectionKey] ?? true);
  const toggleCommandExpanded = useUiStore((s) => s.toggleCommandExpanded);

  const counts = [
    { label: 'Today', value: summaries.today || 0 },
    { label: 'Month', value: summaries.month || 0 },
    { label: 'Overdue', value: summaries.overdue || 0 },
    { label: 'Completed', value: summaries.completed || 0 },
  ];
  const max = Math.max(1, ...counts.map((c) => c.value));

  return (
    <section className="rounded-2xl border border-jarvis-border bg-jarvis-panel p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => toggleCommandExpanded(sectionKey)}
          className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-jarvis-muted hover:text-jarvis-text"
        >
          Task Operations
          {sectionExpanded ? <ChevronDown className="h-4 w-4" strokeWidth={1.75} /> : <ChevronRight className="h-4 w-4" strokeWidth={1.75} />}
        </button>
      </div>

      <div className={['grid transition-all duration-200 ease-out', sectionExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'].join(' ')}>
        <div className="overflow-hidden">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {counts.map((item) => (
              <CountTile key={item.label} label={item.label} value={item.value} max={max} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
