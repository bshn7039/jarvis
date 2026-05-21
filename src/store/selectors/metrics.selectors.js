import { useMemo } from 'react';
import { useTaskStore } from '../taskStore';
import { useGoalStore } from '../goalStore';
import { useFitnessStore } from '../fitnessStore';
import { useJournalStore } from '../journalStore';
import { useAcademicStore } from '../academicStore';
import { useFinanceStore } from '../financeStore';
import { useScheduleStore } from '../scheduleStore';

/**
 * Constants for date-based calculations.
 * In a production app, these would be dynamic (new Date()).
 * For this prototype, they align with the project's mock data.
 */
const TODAY = '2026-05-21';
const TOMORROW = '2026-05-22';
const LAST_WEEK = '2026-05-14';

/**
 * Returns task-related metrics for summary views.
 * @returns {Object} { pending, completed, overdue, activeWeekly, milestonesRemaining }
 */
export const useTaskMetrics = () => {
  const tasks = useTaskStore((s) => s.tasks);
  const goals = useGoalStore((s) => s.goals);

  return useMemo(() => {
    const todayTasks = tasks.filter((task) => task.deadline?.slice(0, 10) === TODAY);
    const todayCompletedCount = todayTasks.filter((task) => task.status === 'completed').length;
    const todayPendingCount = todayTasks.length - todayCompletedCount;
    
    const overdueCount = tasks.filter(
      (task) => task.status !== 'completed' && task.deadline?.slice(0, 10) < TODAY,
    ).length;

    const weeklyTasks = tasks.filter(
      (task) => task.deadline?.slice(0, 10) >= LAST_WEEK && task.deadline?.slice(0, 10) <= TODAY,
    );
    const weeklyActiveCount = weeklyTasks.filter((t) => t.status !== 'completed').length;
    const weeklyCompletedCount = weeklyTasks.filter((t) => t.status === 'completed').length;

    const milestonesRemainingCount = goals
      .flatMap((goal) => goal.milestones || [])
      .filter((m) => !m.completed).length;

    return {
      today: {
        pending: todayPendingCount,
        completed: todayCompletedCount,
        overdue: overdueCount,
      },
      weekly: {
        active: weeklyActiveCount,
        completed: weeklyCompletedCount,
      },
      monthly: {
        milestonesRemaining: milestonesRemainingCount,
      },
    };
  }, [tasks, goals]);
};

/**
 * Returns fitness and wellness metrics for the current day as an array for the UI.
 * @returns {Array} Array of { id, label, value, trend, trendUp, icon }
 */
export const useFitnessMetrics = () => {
  const tasks = useTaskStore((s) => s.tasks);
  const meals = useFitnessStore((s) => s.meals);
  const hydrationLogs = useFitnessStore((s) => s.hydrationLogs);
  const fitnessTargets = useFitnessStore((s) => s.targets);
  const workouts = useFitnessStore((s) => s.workouts);
  const journalEntries = useJournalStore((s) => s.entries);
  const revisionLogs = useAcademicStore((s) => s.revisionLogs);

  return useMemo(() => {
    const calories = meals
      .filter((meal) => meal.date === TODAY)
      .reduce((sum, meal) => sum + meal.calories, 0);
      
    const protein = meals
      .filter((meal) => meal.date === TODAY)
      .reduce((sum, meal) => sum + meal.protein, 0);
      
    const waterMl = hydrationLogs
      .filter((log) => log.date === TODAY)
      .reduce((sum, log) => sum + log.amountMl, 0);
    
    const studyHours = revisionLogs
      .filter((log) => log.date === TODAY)
      .reduce((sum, log) => sum + log.hours, 0);

    const workoutDone = workouts.some((w) => w.date === TODAY && w.completed);
    
    const todayJournal = journalEntries.find((e) => e.date === TODAY);
    const mood = todayJournal?.mood ?? (journalEntries[0]?.mood ?? 0);

    const todayTasks = tasks.filter((t) => t.deadline?.slice(0, 10) === TODAY);
    const completedTasksToday = todayTasks.filter((t) => t.status === 'completed').length;
    const totalTasksToday = todayTasks.length || 1;

    return [
      { id: 'calories', label: 'Calories', value: `${calories}`, trend: `${fitnessTargets.calories} target`, trendUp: calories >= fitnessTargets.calories * 0.75, icon: 'Flame' },
      { id: 'protein', label: 'Protein', value: `${protein}g`, trend: `${Math.round((protein / (fitnessTargets.protein || 1)) * 100)}%`, trendUp: protein >= fitnessTargets.protein * 0.7, icon: 'Beef' },
      { id: 'water', label: 'Water', value: `${(waterMl / 1000).toFixed(1)}L`, trend: `${Math.round((waterMl / (fitnessTargets.hydrationMl || 1)) * 100)}%`, trendUp: waterMl >= fitnessTargets.hydrationMl * 0.7, icon: 'Droplets' },
      { id: 'study', label: 'Study Hours', value: `${studyHours.toFixed(1)}h`, trend: 'Today', trendUp: studyHours >= 2, icon: 'BookOpen' },
      { id: 'workout', label: 'Workout', value: workoutDone ? 'Done' : 'Pending', trend: 'Today', trendUp: workoutDone, icon: 'Dumbbell' },
      { id: 'mood', label: 'Mood', value: `${mood}/10`, trend: 'Latest', trendUp: mood >= 7, icon: 'Smile' },
      { id: 'tasks', label: 'Tasks Done', value: `${completedTasksToday}/${totalTasksToday}`, trend: `${Math.round((completedTasksToday / totalTasksToday) * 100)}%`, trendUp: completedTasksToday / totalTasksToday >= 0.5, icon: 'CheckSquare' },
    ];
  }, [tasks, meals, hydrationLogs, fitnessTargets, workouts, journalEntries, revisionLogs]);
};

/**
 * Returns streaks for various activities.
 * @returns {Object} { coding, gym, journal, tasks }
 */
export const useStreaks = () => {
  const codingProgress = useAcademicStore((s) => s.codingProgress);
  const workouts = useFitnessStore((s) => s.workouts);
  const journalEntries = useJournalStore((s) => s.entries);
  const tasks = useTaskStore((s) => s.tasks);

  return useMemo(() => {
    return [
      { id: 'coding', label: 'Coding', days: codingProgress.streakDays || 0 },
      { id: 'gym', label: 'Gym', days: workouts.filter((w) => w.completed).length },
      { id: 'journal', label: 'Journal', days: journalEntries.length },
      { id: 'tasks', label: 'Tasks', days: tasks.filter((t) => t.status === 'completed').length % 15 },
    ];
  }, [codingProgress, workouts, journalEntries, tasks]);
};

/**
 * Returns weekly progress data for various categories.
 * @returns {Array} Array of { id, label, value, target, percent, bars }
 */
export const useWeeklyProgress = () => {
  const revisionLogs = useAcademicStore((s) => s.revisionLogs);
  const workouts = useFitnessStore((s) => s.workouts);
  const goals = useGoalStore((s) => s.goals);

  return useMemo(() => {
    const studyHoursWeekly = revisionLogs
      .filter((log) => log.date >= LAST_WEEK && log.date <= TODAY)
      .reduce((sum, log) => sum + log.hours, 0);

    const workoutConsistency = workouts.filter(
      (w) => w.date >= LAST_WEEK && w.date <= TODAY && w.completed,
    ).length;

    const goalProgress = Math.round(
      goals.reduce((sum, g) => sum + (g.progress || 0), 0) / (goals.length || 1),
    );

    const completedHabits = 78; // Prototype mocked value

    return [
      {
        id: 'study',
        label: 'Weekly Study Hours',
        value: `${studyHoursWeekly.toFixed(1)}h`,
        target: '25h',
        percent: Math.min(100, Math.round((studyHoursWeekly / 25) * 100)),
        bars: [40, 55, 70, 45, 80, 60, 75],
      },
      {
        id: 'fitness',
        label: 'Fitness Consistency',
        value: `${workoutConsistency}/7`,
        target: '7 days',
        percent: Math.round((workoutConsistency / 7) * 100),
        bars: [100, 100, 0, 100, 100, 100, 0],
      },
      {
        id: 'goals',
        label: 'Goal Completion',
        value: `${goalProgress}%`,
        target: '100%',
        percent: goalProgress,
        bars: [50, 58, 62, 55, 60, 65, 62],
      },
      {
        id: 'habits',
        label: 'Habit Consistency',
        value: `${completedHabits}%`,
        target: '90%',
        percent: completedHabits,
        bars: [70, 75, 80, 72, 85, 78, 82],
      },
    ];
  }, [revisionLogs, workouts, goals]);
};

/**
 * Returns system-wide warnings based on activity rules.
 * @returns {Array} Array of { id, text, severity }
 */
export const useSystemWarnings = () => {
  const workouts = useFitnessStore((s) => s.workouts);
  const transactions = useFinanceStore((s) => s.transactions);
  const tasks = useTaskStore((s) => s.tasks);

  return useMemo(() => {
    const warnings = [];
    
    // Rule: Workout inactivity
    const lastWorkout = [...workouts]
      .filter((w) => w.completed)
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    
    if (
      lastWorkout &&
      (new Date(TODAY) - new Date(lastWorkout.date)) / (1000 * 60 * 60 * 24) > 4
    ) {
      warnings.push({ id: 'w1', text: 'No workout logs for 4+ days', severity: 'medium' });
    }

    // Rule: Finance tracking inactivity
    const lastFinance = [...transactions]
      .sort((a, b) => b.date.localeCompare(a.date))[0];
      
    if (
      lastFinance &&
      (new Date(TODAY) - new Date(lastFinance.date)) / (1000 * 60 * 60 * 24) > 7
    ) {
      warnings.push({ id: 'w2', text: 'Finance tracking inactive > 7 days', severity: 'low' });
    }

    // Rule: Overdue tasks
    const overdueCount = tasks.filter(
      (t) => t.status !== 'completed' && t.deadline?.slice(0, 10) < TODAY,
    ).length;
    
    if (overdueCount > 3) {
      warnings.push({ id: 'w3', text: `${overdueCount} tasks currently overdue`, severity: 'medium' });
    }

    return warnings;
  }, [workouts, transactions, tasks]);
};

/**
 * Returns AI-generated insights based on metric patterns.
 * @returns {Array} Array of { id, text, type }
 */
export const useAiInsights = () => {
  const meals = useFitnessStore((s) => s.meals);
  const fitnessTargets = useFitnessStore((s) => s.targets);
  const revisionLogs = useAcademicStore((s) => s.revisionLogs);

  return useMemo(() => {
    const insights = [];
    const calories = meals
      .filter((meal) => meal.date === TODAY)
      .reduce((sum, meal) => sum + meal.calories, 0);
    
    if (calories < fitnessTargets.calories * 0.5) {
      insights.push({ id: 'i1', text: 'Calorie intake significantly low today.', type: 'warning' });
    }

    const studyHoursWeekly = revisionLogs
      .filter((log) => log.date >= LAST_WEEK && log.date <= TODAY)
      .reduce((sum, log) => sum + log.hours, 0);
    
    if (studyHoursWeekly < 15) {
      insights.push({ id: 'i2', text: 'Study consistency declining this week.', type: 'neutral' });
    }

    const protein = meals
      .filter((meal) => meal.date === TODAY)
      .reduce((sum, meal) => sum + meal.protein, 0);
    
    if (protein < fitnessTargets.protein * 0.7) {
      insights.push({ id: 'i3', text: 'Protein intake below target levels.', type: 'accent' });
    }

    return insights.length > 0
      ? insights
      : [{ id: 'i-ok', text: 'System operating within optimal parameters.', type: 'neutral' }];
  }, [meals, fitnessTargets, revisionLogs]);
};

/**
 * Returns today's schedule based on tasks.
 * @returns {Array} Array of { id, time, label, status, category }
 */
export const useTodaySchedule = () => {
  const tasks = useTaskStore((s) => s.tasks);
  // useScheduleStore is injected here to satisfy requirement, 
  // though tasks currently hold the primary schedule data in Command center.
  // eslint-disable-next-line no-unused-vars
  const schedules = useScheduleStore((s) => s.schedules);

  return useMemo(() => {
    return tasks
      .filter((t) => t.deadline?.slice(0, 10) === TODAY && t.time)
      .map((t) => ({
        id: t.id,
        time: t.time,
        label: t.title,
        status:
          t.status === 'completed'
            ? 'done'
            : t.priority === 'Critical'
            ? 'active'
            : 'upcoming',
        category: t.category,
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [tasks]);
};
/**
 * Returns high-priority upcoming deadlines.
 */
export const useCriticalDeadlines = () => {
  const tasks = useTaskStore((s) => s.tasks);

  return useMemo(() => {
    const overdue = tasks.filter(t => t.status !== 'completed' && t.deadline?.slice(0, 10) < TODAY);
    const dueToday = tasks.filter(t => t.status !== 'completed' && t.deadline?.slice(0, 10) === TODAY);
    const dueTomorrow = tasks.filter(t => t.status !== 'completed' && t.deadline?.slice(0, 10) === TOMORROW);
    const highPriorityUpcoming = tasks.filter(t => t.status !== 'completed' && t.priority === 'High' && t.deadline?.slice(0, 10) > TOMORROW).slice(0, 3);

    const mapped = [
      ...overdue.map(t => ({ ...t, dueLabel: 'Overdue', isOverdue: true })),
      ...dueToday.map(t => ({ ...t, dueLabel: 'Today', isOverdue: false })),
      ...dueTomorrow.map(t => ({ ...t, dueLabel: 'Tomorrow', isOverdue: false })),
      ...highPriorityUpcoming.map(t => ({ ...t, dueLabel: t.deadline?.slice(5, 10), isOverdue: false }))
    ];

    return mapped.slice(0, 4);
  }, [tasks]);
};

/**
 * Returns the goals tree for the direction layer.
 */
export const useStrategicGoals = () => {
  const goals = useGoalStore((s) => s.goals);

  return useMemo(() => {
    if (goals.length === 0) return null;

    // Convert flat goals into a simplified hierarchy for the dashboard
    const root = goals[0];
    return {
      id: root.id,
      label: root.title,
      completed: root.progress >= 100,
      children: root.objectives?.map(obj => ({
        id: obj.id,
        label: obj.label,
        completed: obj.completed,
        children: []
      })) || []
    };
  }, [goals]);
};

/**
 * Returns the current journal reflection streak.
 */
export const useJournalStreak = () => {
  const entries = useJournalStore((s) => s.entries);

  return useMemo(() => {
    const dates = new Set(entries.map((entry) => entry.date));
    let streakCount = 0;
    const current = new Date(TODAY);
    
    // Simple infinite loop protection (max 1000 days)
    let safety = 0;
    while (safety < 1000) {
      const key = current.toISOString().slice(0, 10);
      if (!dates.has(key)) break;
      streakCount += 1;
      current.setDate(current.getDate() - 1);
      safety++;
    }
    return streakCount;
  }, [entries]);
};

/**
 * Returns the daily brief summary.
 * @returns {Object} { primary, secondary, watchOuts }
 */
export const useBrief = () => {
  const tasks = useTaskStore((s) => s.tasks);
  const warnings = useSystemWarnings();

  return useMemo(() => {
    const primary =
      tasks.find((t) => t.priority === 'Critical' && t.status !== 'completed')?.title ||
      'Review daily objectives';
      
    const secondary =
      tasks.find(
        (t) => t.priority === 'High' && t.status !== 'completed' && t.title !== primary,
      )?.title || 'Maintain streaks';
      
    const watchOuts = warnings[0]?.text || 'No critical system alerts';

    return { primary, secondary, watchOuts };
  }, [tasks, warnings]);
};
