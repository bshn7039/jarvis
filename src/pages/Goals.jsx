import { useMemo } from 'react';
import ModulePageLayout from '../components/layout/ModulePageLayout';
import PagePanel from '../components/ui/PagePanel';
import GoalHierarchyTree from '../components/goals/GoalHierarchyTree';
import { useGoalStore } from '../store/goalStore';
import { useTaskStore } from '../store/taskStore';
import { Shield, Target, Zap } from 'lucide-react';

export default function Goals() {
  const goals = useGoalStore((s) => s.goals);
  const addGoal = useGoalStore((s) => s.addGoal);

  const tasks = useTaskStore((s) => s.tasks);
  const tasksById = useMemo(() => Object.fromEntries(tasks.map((task) => [task.id, task])), [tasks]);

  const stats = useMemo(() => {
    const totalAreas = goals.filter(g => g.type === 'area').length;
    const totalGoals = goals.filter(g => g.type === 'goal').length;
    const subGoals = goals.filter(g => g.type === 'sub_goal');
    const totalLinkedTasks = subGoals.reduce((acc, sg) => acc + (sg.linkedTaskIds?.length || 0), 0);
    
    return { totalAreas, totalGoals, totalLinkedTasks };
  }, [goals]);

  return (
    <ModulePageLayout
      title="Life Direction"
      subtitle="Strategic command tree. Life Area -> Main Goal -> Objective -> Sub Goal -> Tasks."
    >
      <PagePanel
        title="Goals Overview"
        subtitle="Track your life areas, main goals, and linked tasks."
        actions={
          <button
            type="button"
            onClick={() => addGoal({ title: 'New Strategic Node', type: 'area' })}
            className="rounded-lg border border-jarvis-border bg-white/5 px-3 py-1.5 text-xs text-jarvis-text hover:bg-white/10"
          >
            New Area
          </button>
        }
      >
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-jarvis-border bg-black/20 p-3">
            <div className="flex items-center gap-2 text-jarvis-muted">
              <Shield className="h-3.5 w-3.5" />
              <p className="text-[10px] uppercase tracking-widest">Life Areas</p>
            </div>
            <p className="mt-1 text-lg font-medium text-jarvis-text">{stats.totalAreas}</p>
          </div>
          <div className="rounded-xl border border-jarvis-border bg-black/20 p-3">
            <div className="flex items-center gap-2 text-jarvis-muted">
              <Target className="h-3.5 w-3.5" />
              <p className="text-[10px] uppercase tracking-widest">Main Goals</p>
            </div>
            <p className="mt-1 text-lg font-medium text-jarvis-text">{stats.totalGoals}</p>
          </div>
          <div className="rounded-xl border border-jarvis-border bg-black/20 p-3">
            <div className="flex items-center gap-2 text-jarvis-muted">
              <Zap className="h-3.5 w-3.5" />
              <p className="text-[10px] uppercase tracking-widest">Exec Layer</p>
            </div>
            <p className="mt-1 text-lg font-medium text-jarvis-text">{stats.totalLinkedTasks} Tasks</p>
          </div>
        </div>
      </PagePanel>

      <PagePanel title="Strategic Hierarchy" subtitle="Recursive command map with task-derived progress.">
        <GoalHierarchyTree
          goals={goals}
          tasksById={tasksById}
        />
      </PagePanel>
    </ModulePageLayout>
  );
}
