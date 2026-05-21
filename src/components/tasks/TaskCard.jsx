import { CalendarClock, ChevronDown, ChevronRight, Circle, CircleCheck, Link2 } from 'lucide-react';
import ProgressBar from '../ui/ProgressBar';

const priorityClassMap = {
  Critical: 'border-l-2 border-l-jarvis-accent',
  High: 'border-l-2 border-l-white/70',
  Medium: 'border-l-2 border-l-jarvis-muted/70',
  Low: 'border-l-2 border-l-jarvis-border',
};

const categoryClassMap = {
  Academics: 'border-jarvis-accent/25 bg-jarvis-accent/10 text-jarvis-accent',
  Fitness: 'border-jarvis-border bg-white/5 text-jarvis-text/80',
  'Self Care': 'border-jarvis-border bg-white/[0.03] text-jarvis-muted',
  'Skill Building': 'border-jarvis-muted/30 bg-jarvis-muted/10 text-jarvis-muted',
  Finance: 'border-jarvis-border bg-white/5 text-jarvis-muted',
  Social: 'border-jarvis-border bg-white/[0.03] text-jarvis-muted',
  System: 'border-jarvis-accent/15 bg-jarvis-accent/5 text-jarvis-accent/80',
};

export default function TaskCard({
  task,
  goalTitle,
  scheduleLabel,
  isExpanded,
  onToggleExpanded,
  onToggleCompleted,
}) {
  const done = task.status === 'completed';

  return (
    <article
      className={[
        'rounded-xl border border-jarvis-border bg-black/20 p-3 transition duration-200',
        priorityClassMap[task.priority] ?? priorityClassMap.Low,
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => onToggleCompleted(task.id)}
          className="mt-0.5 text-jarvis-muted transition hover:text-jarvis-accent"
          aria-label={done ? 'Mark task incomplete' : 'Mark task complete'}
        >
          {done ? (
            <CircleCheck className="h-4 w-4 text-jarvis-accent" strokeWidth={1.75} />
          ) : (
            <Circle className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className={['text-sm', done ? 'line-through text-jarvis-muted' : 'text-jarvis-text'].join(' ')}>
              {task.title}
            </h3>
            <button
              type="button"
              onClick={() => onToggleExpanded(task.id)}
              className="rounded p-0.5 text-jarvis-muted transition hover:bg-white/5 hover:text-jarvis-text"
              aria-label={isExpanded ? 'Collapse task details' : 'Expand task details'}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
              ) : (
                <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
              )}
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span
              className={[
                'rounded-full border px-2 py-0.5 text-[10px]',
                categoryClassMap[task.category] ?? categoryClassMap.System,
              ].join(' ')}
            >
              {task.category}
            </span>
            <span className="rounded-full border border-jarvis-border px-2 py-0.5 text-[10px] text-jarvis-muted">
              {task.priority}
            </span>
            <span className="rounded-full border border-jarvis-border px-2 py-0.5 text-[10px] text-jarvis-muted">
              {task.estimatedTime}
            </span>
          </div>

          <div className="mt-3">
            <ProgressBar value={task.progress} />
            <p className="mt-1 text-[11px] text-jarvis-muted">{task.progress}% progress</p>
          </div>

          <div
            className={[
              'grid transition-all duration-200',
              isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
            ].join(' ')}
          >
            <div className="overflow-hidden">
              <p className="mt-3 text-xs leading-relaxed text-jarvis-muted">{task.description}</p>
              <div className="mt-3 space-y-1 text-[11px] text-jarvis-muted">
                <p className="flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Due: {new Date(task.deadline).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Goal: {goalTitle || 'Unlinked'} | Schedule: {scheduleLabel || 'Flexible'}
                </p>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {task.tags.map((tag) => (
                  <span key={tag} className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] text-jarvis-muted">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
