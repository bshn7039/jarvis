import { CalendarClock, ChevronDown, ChevronRight, Circle, CircleCheck, Pencil, Trash2 } from 'lucide-react';
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
  onProgressChange,
  onDelete,
  onEdit,
}) {
  const done = Boolean(task.completed || task.bucket === 'completed');

  return (
    <article
      draggable
      onDragStart={(event) => event.dataTransfer.setData('text/task-id', task.id)}
      className={[
        'rounded-xl border border-jarvis-border bg-black/20 p-3 transition duration-200',
        priorityClassMap[task.priority] ?? priorityClassMap.low,
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <button type="button" onClick={() => onToggleCompleted(task.id)} className="mt-0.5 text-jarvis-muted transition hover:text-jarvis-accent" aria-label={done ? 'Mark task incomplete' : 'Mark task complete'}>
          {done ? <CircleCheck className="h-4 w-4 text-jarvis-accent" strokeWidth={1.75} /> : <Circle className="h-4 w-4" strokeWidth={1.75} />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <button type="button" onClick={() => onOpenDetail(task.id)} className={['truncate text-left text-sm transition hover:text-jarvis-accent', done ? 'line-through text-jarvis-muted' : 'text-jarvis-text'].join(' ')}>
              {task.title}
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit?.(task.id)}
                className="rounded p-0.5 text-jarvis-muted transition hover:bg-white/5 hover:text-jarvis-text"
                aria-label="Edit task"
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => onDelete?.(task.id)}
                className="rounded p-0.5 text-jarvis-muted transition hover:bg-white/5 hover:text-jarvis-text"
                aria-label="Delete task"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
              <button type="button" onClick={() => onToggleExpanded(task.id)} className="rounded p-0.5 text-jarvis-muted transition hover:bg-white/5 hover:text-jarvis-text" aria-label={isExpanded ? 'Collapse task details' : 'Expand task details'}>
                {isExpanded ? <ChevronDown className="h-4 w-4" strokeWidth={1.75} /> : <ChevronRight className="h-4 w-4" strokeWidth={1.75} />}
              </button>
            </div>
          </div>

          <p className="mt-1 line-clamp-2 text-xs text-jarvis-muted">{task.description || 'No description'}</p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
            <span className="rounded-full border border-jarvis-border px-2 py-0.5 text-jarvis-muted">{task.priority}</span>
            <span className="rounded-full border border-jarvis-border px-2 py-0.5 text-jarvis-muted">{task.category}</span>
            {(task.subTags || []).slice(0, 2).map((tag) => (
              <span key={tag} className="rounded-full border border-jarvis-border px-2 py-0.5 text-jarvis-muted">{tag}</span>
            ))}
            <span className="rounded-full border border-jarvis-border px-2 py-0.5 text-jarvis-muted">L:{(task.linkedGoalIds?.length || 0) + (task.linkedJournalIds?.length || 0) + (task.linkedAcademicIds?.length || 0) + (task.linkedScheduleIds?.length || 0)}</span>
          </div>

          <div className="mt-3">
            <ProgressBar value={task.progress} />
            <div className="mt-1 flex items-center justify-between">
              <p className="text-[11px] text-jarvis-muted">{task.progress}% progress</p>
              <input type="range" min={0} max={100} step={5} value={task.progress} onChange={(event) => onProgressChange(task.id, event.target.value)} className="h-1.5 w-24 accent-white" />
            </div>
          </div>

          <div className={['grid transition-all duration-200', isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'].join(' ')}>
            <div className="overflow-hidden">
              <div className="mt-3 space-y-1 text-[11px] text-jarvis-muted">
                <p className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" strokeWidth={1.75} />Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</p>
                <p>Bucket: {task.bucket} | Goal: {goalTitle || 'Unlinked'} | Schedule: {scheduleLabel || 'Flexible'}</p>
                {done && task.completionNotes ? <p>Notes: {task.completionNotes}</p> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
