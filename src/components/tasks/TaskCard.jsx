import { CalendarClock, ChevronDown, ChevronRight, Circle, CircleCheck } from 'lucide-react';
import ProgressBar from '../ui/ProgressBar';

const priorityClassMap = {
  critical: 'border-l-2 border-l-jarvis-accent',
  high: 'border-l-2 border-l-white/70',
  medium: 'border-l-2 border-l-jarvis-muted/70',
  low: 'border-l-2 border-l-jarvis-border',
};

export default function TaskCard({
  task,
  goalTitle,
  scheduleLabel,
  isExpanded,
  onToggleExpanded,
  onToggleCompleted,
  onOpenDetail,
  onStatusChange,
  onProgressChange,
}) {
  const done = task.status === 'completed';

  return (
    <article
      className={[
        'rounded-xl border border-jarvis-border bg-black/20 p-3 transition duration-200',
        priorityClassMap[task.priority] ?? priorityClassMap.low,
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
            <button
              type="button"
              onClick={() => onOpenDetail(task.id)}
              className={[
                'truncate text-left text-sm transition hover:text-jarvis-accent',
                done ? 'line-through text-jarvis-muted' : 'text-jarvis-text',
              ].join(' ')}
            >
              {task.title}
            </button>
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
            <select
              value={task.status}
              onChange={(event) => onStatusChange(task.id, event.target.value)}
              className="rounded-full border border-jarvis-border bg-black/20 px-2 py-0.5 text-[10px] text-jarvis-text"
            >
              <option value="backlog">Backlog</option>
              <option value="planned">Planned</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
            <span className="rounded-full border border-jarvis-border px-2 py-0.5 text-[10px] text-jarvis-muted">{task.priority}</span>
            <span className="rounded-full border border-jarvis-border px-2 py-0.5 text-[10px] text-jarvis-muted">{task.energy}</span>
          </div>

          <div className="mt-3">
            <ProgressBar value={task.progress} />
            <div className="mt-1 flex items-center justify-between">
              <p className="text-[11px] text-jarvis-muted">{task.progress}% progress</p>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={task.progress}
                onChange={(event) => onProgressChange(task.id, event.target.value)}
                className="h-1.5 w-24 accent-white"
              />
            </div>
          </div>

          <div className={['grid transition-all duration-200', isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'].join(' ')}>
            <div className="overflow-hidden">
              <p className="mt-3 text-xs leading-relaxed text-jarvis-muted">{task.description || 'No description'}</p>
              <div className="mt-3 space-y-1 text-[11px] text-jarvis-muted">
                <p className="flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Due: {task.deadline ? new Date(task.deadline).toLocaleString() : 'Not set'}
                </p>
                <p>Goal: {goalTitle || 'Unlinked'} | Schedule: {scheduleLabel || 'Flexible'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
