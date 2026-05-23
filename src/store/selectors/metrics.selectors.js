import { useMemo } from 'react';
import { useTaskStore } from '../taskStore';
import { useJournalStore } from '../journalStore';
import { useFinanceStore } from '../financeStore';
import { useFitnessStore } from '../fitnessStore';
import { useAcademicStore } from '../academicStore';

const todayKey = () => new Date().toISOString().slice(0, 10);
const plusDaysKey = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};
const isTaskCompleted = (task) => Boolean(task?.completed || task?.bucket === 'completed' || task?.status === 'completed');

export const useTaskMetrics = () => {
  const tasks = useTaskStore((s) => s.tasks);

  return useMemo(() => {
    const TODAY = todayKey();
    const todayCount = tasks.filter((t) => !t.completed && t.bucket === 'today').length;
    const monthCount = tasks.filter((t) => !t.completed && t.bucket === 'month').length;
    const overdueCount = tasks.filter((t) => !t.completed && t.dueDate?.slice(0, 10) < TODAY).length;
    const completedCount = tasks.filter((t) => t.completed).length;

    return {
      today: todayCount,
      month: monthCount,
      overdue: overdueCount,
      completed: completedCount,
    };
  }, [tasks]);
};

export const useFitnessMetrics = () => {
  const tasks = useTaskStore((s) => s.tasks);
  const meals = useFitnessStore((s) => s.meals);
  const hydrationLogs = useFitnessStore((s) => s.hydrationLogs);
  const fitnessTargets = useFitnessStore((s) => s.targets);
  const workouts = useFitnessStore((s) => s.workouts);
  const journalEntries = useJournalStore((s) => s.entries);
  const revisionLogs = useAcademicStore((s) => s.revisionLogs);

  return useMemo(() => {
    const TODAY = todayKey();
    const calories = meals.filter((meal) => meal.date === TODAY).reduce((sum, meal) => sum + meal.calories, 0);
    const protein = meals.filter((meal) => meal.date === TODAY).reduce((sum, meal) => sum + meal.protein, 0);
    const waterMl = hydrationLogs.filter((log) => log.date === TODAY).reduce((sum, log) => sum + log.amountMl, 0);
    const studyHours = revisionLogs.filter((log) => log.date === TODAY).reduce((sum, log) => sum + log.hours, 0);
    const workoutDone = workouts.some((w) => w.date === TODAY && w.completed);
    
    // Aggregated mood for today
    const todayEntries = journalEntries.filter((e) => e.entryDate === TODAY);
    const moods = todayEntries.map(e => e.mood).filter(m => m !== null);
    const moodAverage = moods.length > 0 ? Math.round(moods.reduce((a, b) => a + b, 0) / moods.length) : null;
    const moodDisplay = moodAverage !== null ? `${moodAverage}/10` : '-';
    const moodTrendUp = moodAverage !== null && moodAverage >= 7;

    const todayTasks = tasks.filter(
      (t) =>
        t?.bucket === 'today' ||
        t?.originalBucket === 'today' ||
        t?.dueDate?.slice(0, 10) === TODAY ||
        (isTaskCompleted(t) && t?.completedAt?.slice(0, 10) === TODAY),
    );
    const completedTasksToday = todayTasks.filter((t) => isTaskCompleted(t)).length;
    const totalTasksToday = todayTasks.length;
    const taskProgressPercent = totalTasksToday > 0 ? Math.round((completedTasksToday / totalTasksToday) * 100) : 0;

    return [
      { id: 'calories', label: 'Calories', value: `${calories}`, trend: `${fitnessTargets.calories} target`, trendUp: calories >= fitnessTargets.calories * 0.75, icon: 'Flame' },
      { id: 'protein', label: 'Protein', value: `${protein}g`, trend: `${Math.round((protein / (fitnessTargets.protein || 1)) * 100)}%`, trendUp: protein >= fitnessTargets.protein * 0.7, icon: 'Beef' },
      { id: 'water', label: 'Water', value: `${(waterMl / 1000).toFixed(1)}L`, trend: `${Math.round((waterMl / (fitnessTargets.hydrationMl || 1)) * 100)}%`, trendUp: waterMl >= fitnessTargets.hydrationMl * 0.7, icon: 'Droplets' },
      { id: 'study', label: 'Study Hours', value: `${studyHours.toFixed(1)}h`, trend: 'Today', trendUp: studyHours >= 2, icon: 'BookOpen' },
      { id: 'workout', label: 'Workout', value: workoutDone ? 'Done' : 'Pending', trend: 'Today', trendUp: workoutDone, icon: 'Dumbbell' },
      { id: 'mood', label: 'Mood', value: moodDisplay, trend: 'Daily Avg', trendUp: moodTrendUp, icon: 'Smile' },
      { id: 'tasks', label: 'Tasks Done', value: `${completedTasksToday}/${totalTasksToday}`, trend: `${taskProgressPercent}%`, trendUp: taskProgressPercent >= 50, icon: 'CheckSquare' },
    ];
  }, [tasks, meals, hydrationLogs, fitnessTargets, workouts, journalEntries, revisionLogs]);
};

export const useStreaks = () => {
  const codingProgress = useAcademicStore((s) => s.codingProgress);
  const workouts = useFitnessStore((s) => s.workouts);
  const journalEntries = useJournalStore((s) => s.entries);
  const tasks = useTaskStore((s) => s.tasks);

  return useMemo(() => [
    { id: 'coding', label: 'Coding', days: codingProgress.streakDays || 0 },
    { id: 'gym', label: 'Gym', days: workouts.filter((w) => w.completed).length },
    { id: 'journal', label: 'Journal', days: journalEntries.length },
    { id: 'tasks', label: 'Tasks', days: tasks.filter((t) => t.completed).length % 15 },
  ], [codingProgress, workouts, journalEntries, tasks]);
};

export const useWeeklyProgress = () => [];

export const useSystemWarnings = () => {
  const tasks = useTaskStore((s) => s.tasks);
  return useMemo(() => {
    const TODAY = todayKey();
    const overdueCount = tasks.filter((t) => !t.completed && t.dueDate?.slice(0, 10) < TODAY).length;
    return overdueCount > 3 ? [{ id: 'w3', text: `${overdueCount} tasks currently overdue`, severity: 'medium' }] : [];
  }, [tasks]);
};

export const useAiInsights = () => [{ id: 'i-ok', text: 'System operating within parameters.', type: 'neutral' }];

export const useTodaySchedule = () => {
  const tasks = useTaskStore((s) => s.tasks);
  return useMemo(
    () =>
      tasks
        .filter((t) => t && t.bucket === 'today')
        .map((t, index) => ({
          id: t.id || `today-task-${index}`,
          time: t.time || '00:00',
          label: t.title || 'Untitled task',
          status: t.completed ? 'done' : 'upcoming',
          category: t.category || 'System',
        }))
        .sort((a, b) => a.time.localeCompare(b.time)),
    [tasks],
  );
};

export const useCriticalDeadlines = () => {
  const tasks = useTaskStore((s) => s.tasks);
  return useMemo(() => {
    const TODAY = todayKey();
    const TOMORROW = plusDaysKey(1);
    const overdue = tasks.filter((t) => !t.completed && t.dueDate?.slice(0, 10) < TODAY);
    const dueToday = tasks.filter((t) => !t.completed && t.dueDate?.slice(0, 10) === TODAY);
    const dueTomorrow = tasks.filter((t) => !t.completed && t.dueDate?.slice(0, 10) === TOMORROW);
    return [
      ...overdue.map((t, index) => ({ ...t, id: t?.id || `overdue-${index}`, dueLabel: 'Overdue', isOverdue: true })),
      ...dueToday.map((t, index) => ({ ...t, id: t?.id || `today-${index}`, dueLabel: 'Today', isOverdue: false })),
      ...dueTomorrow.map((t, index) => ({ ...t, id: t?.id || `tomorrow-${index}`, dueLabel: 'Tomorrow', isOverdue: false })),
    ]
      .filter(Boolean)
      .slice(0, 4);
  }, [tasks]);
};

export const useStrategicGoals = () => null;
export const useJournalStreak = () => 0;
export const useBrief = () => ({ primary: 'Review daily objectives', secondary: 'Maintain streaks', watchOuts: 'No critical system alerts' });
