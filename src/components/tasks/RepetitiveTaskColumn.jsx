import { ChevronDown, ChevronRight, Plus, Flame } from 'lucide-react';

export default function RepetitiveTaskColumn({
  tasks,
  collapsed,
  onToggleCollapsed,
  onToggleCompletion,
  onQuickAdd,
  onDelete,
}) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className="rounded-2xl border border-jarvis-border bg-jarvis-panel p-3 md:p-4">
      <div className="mb-3 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="flex items-center gap-2 text-left text-sm font-medium text-jarvis-text hover:text-white"
        >
          {collapsed ? <ChevronRight className="h-4 w-4 text-jarvis-muted" strokeWidth={1.75} /> : <ChevronDown className="h-4 w-4 text-jarvis-muted" strokeWidth={1.75} />}
          Repeatative Tasks
          <span className="ml-1 rounded-md border border-jarvis-border px-2 py-0.5 text-[11px] text-jarvis-muted font-normal">{tasks.length}</span>
        </button>
        <button
          type="button"
          onClick={onQuickAdd}
          className="rounded-lg border border-jarvis-border p-1 text-jarvis-muted transition hover:bg-white/5 hover:text-jarvis-text"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {!collapsed && (
        <div className="space-y-2">
          {tasks.length === 0 && (
            <p className="rounded-lg border border-dashed border-jarvis-border/70 p-3 text-xs text-jarvis-muted">
              No repetitive tasks active.
            </p>
          )}
          {tasks.map((task) => {
            const isCompletedToday = task.completionHistory?.includes(today);
            return (
              <article
                key={task.id}
                className="group rounded-xl border border-jarvis-border/60 bg-jarvis-bg/30 p-3 transition-colors hover:border-jarvis-muted/40"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onToggleCompletion(task.id)}
                    className={[
                      'mt-1 h-4 w-4 shrink-0 rounded border transition-colors',
                      isCompletedToday 
                        ? 'border-jarvis-accent bg-jarvis-accent/20 text-jarvis-accent' 
                        : 'border-jarvis-border hover:border-jarvis-muted'
                    ].join(' ')}
                  >
                    {isCompletedToday && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mx-auto">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={[
                        'truncate text-sm font-medium transition-colors',
                        isCompletedToday ? 'text-jarvis-muted line-through' : 'text-jarvis-text'
                      ].join(' ')}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-1.5 opacity-60">
                         {task.streak > 0 && (
                           <div className="flex items-center gap-0.5 rounded-full bg-orange-500/10 px-1.5 py-0.5 text-[10px] text-orange-400 border border-orange-500/20">
                             <Flame className="h-3 w-3" fill="currentColor" />
                             <span>{task.streak}</span>
                           </div>
                         )}
                         <button
                           onClick={() => { if(confirm('Delete repetitive task?')) onDelete(task.id); }}
                           className="hidden group-hover:block text-jarvis-muted hover:text-red-400"
                         >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                           </svg>
                         </button>
                      </div>
                    </div>
                    {task.description && (
                      <p className="mt-1 line-clamp-1 text-xs text-jarvis-muted">
                        {task.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="rounded-full border border-jarvis-border/60 bg-black/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-jarvis-muted">
                        {task.category}
                      </span>
                      {task.priority !== 'medium' && (
                        <span className={[
                          'rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-wider',
                          task.priority === 'critical' || task.priority === 'high' ? 'border-red-500/20 text-red-400 bg-red-500/5' : 'border-jarvis-border text-jarvis-muted bg-black/5'
                        ].join(' ')}>
                          {task.priority}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
