import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { categoryStyles } from '../../utils/constants';
import { useUiStore } from '../../store/uiStore';

const statusStyles = {
  done: 'bg-jarvis-muted/30 border-jarvis-muted/40',
  active: 'bg-jarvis-accent/60 border-jarvis-accent shadow-[0_0_10px_rgba(125,211,252,0.35)]',
  upcoming: 'bg-jarvis-border border-jarvis-border',
};

export default function TodaySchedule({ schedule }) {
  const sectionExpanded = useUiStore(
    (s) => s.commandCenter.collapsedSections['command:schedule'] ?? true,
  );
  const toggleCommandExpanded = useUiStore((s) => s.toggleCommandExpanded);

  return (
    <section className="rounded-2xl border border-jarvis-border bg-jarvis-panel p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => toggleCommandExpanded('command:schedule')}
          className="text-sm font-medium uppercase tracking-wider text-jarvis-muted hover:text-jarvis-text"
        >
          Today Schedule
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-jarvis-border px-2.5 py-1.5 text-xs text-jarvis-muted transition-colors duration-200 hover:border-jarvis-muted/40 hover:text-jarvis-text"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
          Add Item
        </button>
      </div>

      <div
        className={[
          'grid transition-all duration-200 ease-out',
          sectionExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        ].join(' ')}
      >
        <div className="overflow-hidden">
          {schedule.length > 0 ? (
            <div className="relative ml-2 border-l border-jarvis-border/80 pl-6">
              {schedule.map((item) => (
                <div
                  key={item.id}
                  className="group relative mb-5 flex gap-2 pb-1 last:mb-0"
                >
                  <span
                    className={[
                      'absolute -left-[29px] top-2 h-3 w-3 rounded-full border-2',
                      statusStyles[item.status],
                    ].join(' ')}
                  />
                  <div className="min-w-0 flex-1 rounded-lg border border-jarvis-border/60 bg-jarvis-bg/30 px-3 py-2 transition-colors duration-200 hover:border-jarvis-muted/30">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-mono text-xs text-jarvis-muted">{item.time}</p>
                        <p className="mt-1 text-sm text-jarvis-text">{item.label}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <span
                          className={[
                            'rounded-full border px-2 py-0.5 text-[10px]',
                            categoryStyles[item.category] ?? categoryStyles.System,
                          ].join(' ')}
                        >
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-sm text-jarvis-muted">
              No items scheduled for today
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
