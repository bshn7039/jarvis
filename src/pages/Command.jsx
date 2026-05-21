import { useMemo } from 'react';
import { LayoutProvider, useLayout } from '../context/LayoutContext';
import Sidebar from '../components/sidebar/Sidebar';
import CommandHeader from '../components/command/CommandHeader';
import FocusCard from '../components/command/FocusCard';
import TaskSummaryCard from '../components/command/TaskSummaryCard';
import MetricCard from '../components/command/MetricCard';
import StreakCard from '../components/command/StreakCard';
import ProgressCard from '../components/command/ProgressCard';
import InsightFeed from '../components/command/InsightFeed';
import WarningPanel from '../components/command/WarningPanel';
import QuickActions from '../components/command/QuickActions';
import TimelineCard from '../components/command/TimelineCard';
import GoalsHierarchy from '../components/command/GoalsHierarchy';
import { useUiStore } from '../store/uiStore';
import { useTaskStore } from '../store/taskStore';
import { useGoalStore } from '../store/goalStore';
import { useFitnessStore } from '../store/fitnessStore';
import { useJournalStore } from '../store/journalStore';
import { useAcademicStore } from '../store/academicStore';
import {
  todayFocus,
  weeklyProgress,
  aiInsights,
  systemWarnings,
  quickActions,
} from '../data/mockCommandData';

function CommandDashboard() {
  const { openMobile } = useLayout();
  const goalsTree = useUiStore((s) => s.commandCenter.goalsTree);
  const tasks = useTaskStore((s) => s.tasks);
  const goals = useGoalStore((s) => s.goals);
  const workouts = useFitnessStore((s) => s.workouts);
  const meals = useFitnessStore((s) => s.meals);
  const hydrationLogs = useFitnessStore((s) => s.hydrationLogs);
  const fitnessTargets = useFitnessStore((s) => s.targets);
  const journalEntries = useJournalStore((s) => s.entries);
  const revisionLogs = useAcademicStore((s) => s.revisionLogs);
  const codingProgress = useAcademicStore((s) => s.codingProgress);

  const today = '2026-05-21';

  const taskSummaries = useMemo(() => {
    const todayTasks = tasks.filter((task) => task.deadline?.slice(0, 10) === today);
    const todayCompleted = todayTasks.filter((task) => task.status === 'completed').length;
    const todayPending = todayTasks.length - todayCompleted;
    const todayOverdue = tasks.filter(
      (task) => task.status !== 'completed' && task.deadline?.slice(0, 10) < today,
    ).length;
    const weeklyActive = tasks.filter((task) => task.section === 'Weekly').length;
    const weeklyCompleted = tasks.filter(
      (task) => task.section === 'Completed' && task.deadline?.slice(0, 10) >= '2026-05-15',
    ).length;
    const monthlyMilestones = goals.flatMap((goal) => goal.milestones || []).length;
    return {
      today: { pending: todayPending, completed: todayCompleted, overdue: todayOverdue },
      weekly: { active: weeklyActive, completed: weeklyCompleted },
      monthly: { milestonesRemaining: monthlyMilestones },
    };
  }, [tasks, goals]);

  const operationalHighlights = useMemo(
    () =>
      tasks
        .filter((task) => ['Critical', 'High'].includes(task.priority))
        .slice(0, 3)
        .map((task) => ({
          id: task.id,
          label: task.title,
          category: task.category,
        })),
    [tasks],
  );

  const dailyMetrics = useMemo(() => {
    const completedTasks = tasks.filter((task) => task.status === 'completed').length;
    const totalTasks = tasks.length || 1;
    const calories = meals.filter((meal) => meal.date === today).reduce((sum, meal) => sum + meal.calories, 0);
    const protein = meals.filter((meal) => meal.date === today).reduce((sum, meal) => sum + meal.protein, 0);
    const waterMl = hydrationLogs
      .filter((log) => log.date === today)
      .reduce((sum, log) => sum + log.amountMl, 0);
    const studyHours = revisionLogs
      .filter((log) => log.date >= '2026-05-15')
      .reduce((sum, log) => sum + log.hours, 0);
    const mood = journalEntries[0]?.mood ?? 0;

    return [
      { id: 'calories', label: 'Calories', value: `${calories}`, trend: `${fitnessTargets.calories} target`, trendUp: calories >= fitnessTargets.calories * 0.75, icon: 'Flame' },
      { id: 'protein', label: 'Protein', value: `${protein}g`, trend: `${Math.round((protein / fitnessTargets.protein) * 100)}%`, trendUp: protein >= fitnessTargets.protein * 0.7, icon: 'Beef' },
      { id: 'water', label: 'Water', value: `${(waterMl / 1000).toFixed(1)}L`, trend: `${Math.round((waterMl / fitnessTargets.hydrationMl) * 100)}%`, trendUp: waterMl >= fitnessTargets.hydrationMl * 0.7, icon: 'Droplets' },
      { id: 'study', label: 'Study Hours', value: `${studyHours.toFixed(1)}h`, trend: '7-day', trendUp: studyHours >= 6, icon: 'BookOpen' },
      { id: 'workout', label: 'Workout', value: workouts.some((w) => w.date === today && w.completed) ? 'Done' : 'Scheduled', trend: 'Today', trendUp: true, icon: 'Dumbbell' },
      { id: 'mood', label: 'Mood', value: `${mood}/10`, trend: 'Latest', trendUp: mood >= 6, icon: 'Smile' },
      { id: 'tasks', label: 'Tasks Done', value: `${completedTasks}/${totalTasks}`, trend: `${Math.round((completedTasks / totalTasks) * 100)}%`, trendUp: completedTasks / totalTasks >= 0.5, icon: 'CheckSquare' },
    ];
  }, [tasks, meals, hydrationLogs, fitnessTargets, revisionLogs, journalEntries, workouts]);

  const streaks = useMemo(
    () => [
      { id: 'coding', label: 'Coding', days: codingProgress.streakDays },
      { id: 'gym', label: 'Gym', days: workouts.filter((workout) => workout.completed).length },
      { id: 'journal', label: 'Journal', days: journalEntries.length },
      { id: 'tasks', label: 'Tasks Complete', days: tasks.filter((task) => task.status === 'completed').length },
    ],
    [codingProgress, workouts, journalEntries, tasks],
  );

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <CommandHeader onMenuClick={openMobile} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1600px] space-y-6 p-4 pb-10 md:p-6 lg:p-8">
          <FocusCard focus={todayFocus} />
          <TaskSummaryCard summaries={taskSummaries} highlights={operationalHighlights} />

          <section>
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-jarvis-muted">
              Daily Metrics
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
              {dailyMetrics.map((metric) => (
                <MetricCard key={metric.id} metric={metric} />
              ))}
            </div>
          </section>

          <StreakCard streaks={streaks} />

          <section>
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-jarvis-muted">
              Weekly Progress
            </h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {weeklyProgress.map((item) => (
                <ProgressCard key={item.id} item={item} />
              ))}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <InsightFeed insights={aiInsights} />
            <WarningPanel warnings={systemWarnings} />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <QuickActions actions={quickActions} />
            </div>
            <TimelineCard />
          </div>

          <GoalsHierarchy tree={goalsTree} />
        </div>
      </div>
    </div>
  );
}

export default function Command() {
  return (
    <LayoutProvider>
      <div className="flex h-screen w-full overflow-hidden bg-jarvis-bg">
        <Sidebar />
        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <CommandDashboard />
        </main>
      </div>
    </LayoutProvider>
  );
}
