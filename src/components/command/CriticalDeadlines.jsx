import { AlertCircle, Clock } from 'lucide-react';
import { categoryStyles } from '../../utils/constants';

export default function CriticalDeadlines({ deadlines }) {
  return (
    <section className="rounded-2xl border border-jarvis-border bg-jarvis-panel p-5 md:p-6">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-jarvis-muted">
        Critical Deadlines
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {deadlines.length > 0 ? (
          deadlines.map((item) => (
            <div
              key={item.id}
              className={[
                'relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 hover:bg-white/[0.02]',
                item.isOverdue 
                  ? 'border-jarvis-muted/40 bg-jarvis-muted/5' 
                  : 'border-jarvis-border bg-jarvis-bg/40'
              ].join(' ')}
            >
              <div className="mb-3">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span
                    className={[
                      'rounded-full border px-2 py-0.5 text-[10px]',
                      categoryStyles[item.category] ?? categoryStyles.System,
                    ].join(' ')}
                  >
                    {item.category}
                  </span>
                  {item.priority === 'Critical' && (
                    <AlertCircle className="h-3.5 w-3.5 text-jarvis-muted" strokeWidth={1.75} />
                  )}
                </div>
                <p className="text-sm font-medium text-jarvis-text">{item.title}</p>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-jarvis-muted">
                <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span className={item.isOverdue ? 'text-jarvis-muted' : ''}>
                  {item.dueLabel}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-4 text-center text-sm text-jarvis-muted">
            No critical deadlines
          </div>
        )}
      </div>
    </section>
  );
}
