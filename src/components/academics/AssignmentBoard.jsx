import ProgressBar from '../ui/ProgressBar';

export default function AssignmentBoard({ assignments, onUpdateProgress }) {
  return (
    <div className="space-y-2">
      {assignments.map((assignment) => (
        <article key={assignment.id} className="rounded-xl border border-jarvis-border bg-black/20 p-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm text-jarvis-text">{assignment.title}</p>
              <p className="mt-1 text-xs text-jarvis-muted">Due {assignment.dueDate}</p>
            </div>
            <span className="rounded-full border border-jarvis-border px-2 py-0.5 text-[11px] text-jarvis-muted">
              {assignment.status}
            </span>
          </div>
          <div className="mt-2">
            <ProgressBar value={assignment.progress} />
            <label className="mt-2 flex items-center gap-2 text-xs text-jarvis-muted">
              Progress
              <input
                type="range"
                min={0}
                max={100}
                value={assignment.progress}
                onChange={(event) => onUpdateProgress(assignment.id, Number(event.target.value))}
                className="accent-jarvis-accent"
              />
              <span className="text-jarvis-text">{assignment.progress}%</span>
            </label>
          </div>
        </article>
      ))}
    </div>
  );
}
