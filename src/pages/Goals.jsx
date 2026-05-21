import { useMemo } from 'react';
import ModulePageLayout from '../components/layout/ModulePageLayout';
import PagePanel from '../components/ui/PagePanel';
import GoalHierarchyTree from '../components/goals/GoalHierarchyTree';
import MilestoneBoard from '../components/goals/MilestoneBoard';
import { useGoalStore } from '../store/goalStore';
import { useTaskStore } from '../store/taskStore';

export default function Goals() {
  const goals = useGoalStore((s) => s.goals);
  const selectedGoalId = useGoalStore((s) => s.selectedGoalId);
  const collapsedGoalIds = useGoalStore((s) => s.collapsedGoalIds);
  const expandedObjectives = useGoalStore((s) => s.expandedObjectives);
  const setSelectedGoalId = useGoalStore((s) => s.setSelectedGoalId);
  const toggleGoalCollapsed = useGoalStore((s) => s.toggleGoalCollapsed);
  const toggleObjectiveExpanded = useGoalStore((s) => s.toggleObjectiveExpanded);

  const tasks = useTaskStore((s) => s.tasks);
  const tasksById = useMemo(() => Object.fromEntries(tasks.map((task) => [task.id, task])), [tasks]);

  const selectedGoal = goals.find((goal) => goal.id === selectedGoalId) ?? goals[0];

  return (
    <ModulePageLayout
      title="Goals"
      subtitle="Life goal -> mission -> phase -> objectives -> tasks."
    >
      <PagePanel
        title={selectedGoal?.title || 'Goal System'}
        subtitle={selectedGoal?.mission}
      >
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-jarvis-border bg-black/20 p-3">
            <p className="text-xs uppercase tracking-wide text-jarvis-muted">Life Goal</p>
            <p className="mt-1 text-sm text-jarvis-text">{selectedGoal?.lifeGoal}</p>
          </div>
          <div className="rounded-xl border border-jarvis-border bg-black/20 p-3">
            <p className="text-xs uppercase tracking-wide text-jarvis-muted">Current Phase</p>
            <p className="mt-1 text-sm text-jarvis-text">{selectedGoal?.currentPhase}</p>
          </div>
          <div className="rounded-xl border border-jarvis-border bg-black/20 p-3">
            <p className="text-xs uppercase tracking-wide text-jarvis-muted">Connected Tasks</p>
            <p className="mt-1 text-sm text-jarvis-text">
              {selectedGoal?.objectives.reduce((acc, objective) => acc + objective.taskIds.length, 0)}
            </p>
          </div>
        </div>
      </PagePanel>

      <PagePanel title="Goal Hierarchy" subtitle="Expandable relationship tree with linked task nodes.">
        <GoalHierarchyTree
          goals={goals}
          tasksById={tasksById}
          collapsedGoalIds={collapsedGoalIds}
          expandedObjectives={expandedObjectives}
          selectedGoalId={selectedGoalId}
          onSelectGoal={setSelectedGoalId}
          onToggleGoalCollapsed={toggleGoalCollapsed}
          onToggleObjectiveExpanded={toggleObjectiveExpanded}
        />
      </PagePanel>

      <PagePanel title="Milestone Roadmap" subtitle="Operational checkpoints across all active goals.">
        <MilestoneBoard goals={goals} />
      </PagePanel>
    </ModulePageLayout>
  );
}
