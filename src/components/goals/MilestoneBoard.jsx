import ProgressBar from '../ui/ProgressBar';

export default function MilestoneBoard({ goals }) {
  const milestones = goals.flatMap((goal) =>
    goal.milestones.map((milestone) => ({
      ...milestone,
      goalTitle: goal.title,
    })),
  );

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {milestones.map((milestone) => (
        <article key={milestone.id} className="rounded-xl border border-jarvis-border bg-black/20 p-3">
          <p className="text-xs uppercase tracking-wide text-jarvis-muted">{milestone.goalTitle}</p>
          <h4 className="mt-1 text-sm text-jarvis-text">{milestone.title}</h4>
          <p className="mt-1 text-[11px] text-jarvis-muted">
            Due {new Date(milestone.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <div className="mt-2">
            <ProgressBar value={milestone.progress} />
            <p className="mt-1 text-[11px] text-jarvis-muted">{milestone.progress}% done</p>
          </div>
        </article>
      ))}
    </div>
  );
}
