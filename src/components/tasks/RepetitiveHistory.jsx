import { ChevronDown, ChevronRight, CheckCircle2, XCircle, Trash2 } from 'lucide-react';

export default function RepetitiveHistory({ history, collapsed, onToggleCollapsed, onDeleteEntry }) {
  return (
    <section className="rounded-2xl border border-jarvis-border bg-jarvis-panel p-3 md:p-4 mt-6">
      <button
        type="button"
        onClick={onToggleCollapsed}
        className="mb-3 flex w-full items-center justify-between rounded-lg px-1 py-1 text-left text-sm font-medium text-jarvis-text hover:bg-white/[0.03]"
      >
        <span className="flex items-center gap-2">
          {collapsed ? <ChevronRight className="h-4 w-4 text-jarvis-muted" strokeWidth={1.75} /> : <ChevronDown className="h-4 w-4 text-jarvis-muted" strokeWidth={1.75} />}
          Repeatative Completed History
        </span>
      </button>

      {!collapsed && (
        <div className="space-y-6">
          {history.length === 0 && (
            <p className="py-8 text-center text-xs text-jarvis-muted italic">No completion history recorded yet.</p>
          )}
          {history.map((day) => (
            <div key={day.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-jarvis-muted/80 flex items-center gap-2 flex-1">
                  <span className="h-px flex-1 bg-jarvis-border/40" />
                  {day.date}
                  <span className="h-px flex-1 bg-jarvis-border/40" />
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete repetitive history for ${day.date}?`)) {
                      onDeleteEntry?.(day.id);
                    }
                  }}
                  className="rounded border border-jarvis-border px-2 py-1 text-[10px] text-jarvis-muted transition hover:text-red-300"
                  title={`Delete ${day.date} history`}
                >
                  <span className="inline-flex items-center gap-1">
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </span>
                </button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                {/* Completed */}
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wide text-jarvis-accent/70 font-medium flex items-center gap-1.5 px-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Completed ({day.completedIds.length})
                  </p>
                  <div className="space-y-1.5">
                    {day.completedIds.map(id => {
                      const task = day.snapshot.find(t => t.id === id);
                      return (
                        <div key={id} className="rounded-lg border border-jarvis-border/40 bg-black/10 px-3 py-2 text-xs text-jarvis-text/90">
                          {task?.title || 'Unknown Task'}
                        </div>
                      );
                    })}
                    {day.completedIds.length === 0 && (
                      <p className="text-[11px] text-jarvis-muted/50 italic px-1">None completed.</p>
                    )}
                  </div>
                </div>

                {/* Missed */}
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wide text-red-400/70 font-medium flex items-center gap-1.5 px-1">
                    <XCircle className="h-3 w-3" />
                    Missed ({day.missedIds.length})
                  </p>
                  <div className="space-y-1.5">
                    {day.missedIds.map(id => {
                      const task = day.snapshot.find(t => t.id === id);
                      return (
                        <div key={id} className="rounded-lg border border-jarvis-border/40 bg-black/5 px-3 py-2 text-xs text-jarvis-muted/80 line-through">
                          {task?.title || 'Unknown Task'}
                        </div>
                      );
                    })}
                    {day.missedIds.length === 0 && (
                      <p className="text-[11px] text-jarvis-muted/50 italic px-1">None missed.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
