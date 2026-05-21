import { ChevronDown, ChevronRight, Flag, Network, Route } from 'lucide-react';
import GoalProgressRing from './GoalProgressRing';

export default function GoalHierarchyTree({
  goals,
  tasksById,
  collapsedGoalIds,
  expandedObjectives,
  selectedGoalId,
  onSelectGoal,
  onToggleGoalCollapsed,
  onToggleObjectiveExpanded,
}) {
  return (
    <div className="space-y-3">
      {goals.map((goal) => {
        const goalCollapsed = Boolean(collapsedGoalIds[goal.id]);
        return (
          <article
            key={goal.id}
            className={[
              'rounded-2xl border bg-black/20 p-4 transition',
              selectedGoalId === goal.id ? 'border-jarvis-accent/45' : 'border-jarvis-border',
            ].join(' ')}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  onSelectGoal(goal.id);
                  onToggleGoalCollapsed(goal.id);
                }}
                className="flex min-w-0 items-start gap-2 text-left"
              >
                {goalCollapsed ? (
                  <ChevronRight className="mt-0.5 h-4 w-4 text-jarvis-muted" strokeWidth={1.75} />
                ) : (
                  <ChevronDown className="mt-0.5 h-4 w-4 text-jarvis-muted" strokeWidth={1.75} />
                )}
                <div>
                  <p className="text-xs uppercase tracking-wide text-jarvis-muted">{goal.lifeGoal}</p>
                  <h3 className="text-sm text-jarvis-text md:text-base">{goal.title}</h3>
                  <p className="mt-1 text-xs text-jarvis-muted">{goal.currentPhase}</p>
                </div>
              </button>
              <GoalProgressRing value={goal.progress} />
            </div>

            {!goalCollapsed && (
              <div className="mt-4 space-y-3">
                <p className="text-xs text-jarvis-muted">{goal.mission}</p>
                {goal.objectives.map((objective) => {
                  const open = Boolean(expandedObjectives[objective.id]);
                  return (
                    <div key={objective.id} className="rounded-xl border border-jarvis-border/90 bg-black/20 p-3">
                      <button
                        type="button"
                        onClick={() => onToggleObjectiveExpanded(objective.id)}
                        className="flex w-full items-center justify-between text-left"
                      >
                        <p className="flex items-center gap-2 text-sm text-jarvis-text">
                          <Network className="h-3.5 w-3.5 text-jarvis-muted" strokeWidth={1.75} />
                          {objective.title}
                        </p>
                        <span className="text-xs text-jarvis-muted">{objective.progress}%</span>
                      </button>
                      {open && (
                        <div className="mt-2 space-y-1.5 border-t border-jarvis-border/80 pt-2">
                          {objective.taskIds.map((taskId) => {
                            const task = tasksById[taskId];
                            if (!task) return null;
                            return (
                              <p key={taskId} className="flex items-center gap-2 text-xs text-jarvis-muted">
                                <Route className="h-3.5 w-3.5" strokeWidth={1.75} />
                                {task.title}
                              </p>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="grid gap-2 md:grid-cols-2">
                  {goal.milestones.map((milestone) => (
                    <div key={milestone.id} className="rounded-xl border border-jarvis-border bg-black/20 p-3">
                      <p className="flex items-center gap-1.5 text-xs text-jarvis-text">
                        <Flag className="h-3.5 w-3.5 text-jarvis-muted" strokeWidth={1.75} />
                        {milestone.title}
                      </p>
                      <p className="mt-1 text-[11px] text-jarvis-muted">
                        Due {new Date(milestone.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
