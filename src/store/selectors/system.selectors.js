import { useMemo } from 'react';
import { useActivityStore } from '../activityStore';
import { useTaskStore } from '../taskStore';
import { useGoalStore } from '../goalStore';
import { useJournalStore } from '../journalStore';
import { useFinanceStore } from '../financeStore';
import { useFitnessStore } from '../fitnessStore';
import { useAcademicStore } from '../academicStore';

const selectActivities = (s) => s.activities;
const selectTasks = (s) => s.tasks;
const selectGoals = (s) => s.goals;
const selectJournalEntries = (s) => s.entries;
const selectTransactions = (s) => s.transactions;
const selectWorkouts = (s) => s.workouts;
const selectRevisionLogs = (s) => s.revisionLogs;

export const useRecentActivities = (limit = 20) => {
  const activities = useActivityStore(selectActivities);
  return useMemo(() => activities.slice(0, limit), [activities, limit]);
};

export const useTodayActivityCount = () => {
  const activities = useActivityStore(selectActivities);
  return useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return activities.filter((a) => a.timestamp.slice(0, 10) === today).length;
  }, [activities]);
};

export const useCompletionRate = () => {
  const tasks = useTaskStore(selectTasks);
  return useMemo(() => {
    if (!tasks.length) return 0;
    return Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100);
  }, [tasks]);
};

export const useProductivityScore = () => {
  const tasks = useTaskStore(selectTasks);
  const goals = useGoalStore(selectGoals);
  const journalEntries = useJournalStore(selectJournalEntries);
  const workouts = useFitnessStore(selectWorkouts);

  return useMemo(() => {
    const completedTasks = tasks.filter((t) => t.completed).length;
    const activeGoals = goals.filter((g) => g.progress > 0 && g.progress < 100).length;
    const journalCount = journalEntries.length;
    const workoutCount = workouts.filter((w) => w.completed).length;
    return Math.min(Math.min(completedTasks * 5, 30) + Math.min(activeGoals * 10, 20) + Math.min(journalCount * 2, 20) + Math.min(workoutCount * 5, 30), 100);
  }, [tasks, goals, journalEntries, workouts]);
};

export const useActiveGoals = () => {
  const goals = useGoalStore(selectGoals);
  return useMemo(() => goals.filter((g) => g.progress < 100), [goals]);
};

export const useOverdueTasks = () => {
  const tasks = useTaskStore(selectTasks);
  return useMemo(() => {
    const now = new Date().toISOString().slice(0, 10);
    return tasks.filter((t) => !t.completed && t.dueDate && t.dueDate.slice(0, 10) < now);
  }, [tasks]);
};

export const useStudyHoursThisWeek = () => {
  const revisionLogs = useAcademicStore(selectRevisionLogs);
  return useMemo(() => revisionLogs.reduce((sum, r) => sum + (r.hours || 0), 0), [revisionLogs]);
};

export const useWorkoutConsistency = () => ({ total: 0, completed: 0, rate: 0 });
export const useJournalConsistency = () => ({ total: 0, daysActive: 0, rate: 0 });
export const useFinanceTrackingStatus = () => {
  const transactions = useFinanceStore(selectTransactions);
  return useMemo(() => ({ totalTransactions: transactions.length, income: 0, expenses: 0, net: 0, tracked: transactions.length > 0 }), [transactions]);
};
