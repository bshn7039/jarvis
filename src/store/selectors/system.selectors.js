import { useMemo } from 'react';
import { useActivityStore } from '../activityStore';
import { useTaskStore } from '../taskStore';
import { useGoalStore } from '../goalStore';
import { useJournalStore } from '../journalStore';
import { useFinanceStore } from '../financeStore';
import { useFitnessStore } from '../fitnessStore';
import { useAcademicStore } from '../academicStore';

// Stable primitive selectors
const selectActivities = (s) => s.activities;
const selectTasks = (s) => s.tasks;
const selectGoals = (s) => s.goals;
const selectJournalEntries = (s) => s.entries;
const selectTransactions = (s) => s.transactions;
const selectWorkouts = (s) => s.workouts;
const selectMeals = (s) => s.meals;
const selectHydrationLogs = (s) => s.hydrationLogs;
const selectAssignments = (s) => s.assignments;
const selectRevisionLogs = (s) => s.revisionLogs;

export const useRecentActivities = (limit = 20) => {
  const activities = useActivityStore(selectActivities);
  return useMemo(() => activities.slice(0, limit), [activities, limit]);
};

export const useTodayActivityCount = () => {
  const activities = useActivityStore(selectActivities);
  return useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return activities.filter(a => a.timestamp.slice(0, 10) === today).length;
  }, [activities]);
};

export const useCompletionRate = () => {
  const tasks = useTaskStore(selectTasks);
  return useMemo(() => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / tasks.length) * 100);
  }, [tasks]);
};

export const useProductivityScore = () => {
  const tasks = useTaskStore(selectTasks);
  const goals = useGoalStore(selectGoals);
  const journalEntries = useJournalStore(selectJournalEntries);
  const workouts = useFitnessStore(selectWorkouts);
  
  return useMemo(() => {
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const activeGoals = goals.filter(g => g.progress > 0 && g.progress < 100).length;
    const journalCount = journalEntries.length;
    const workoutCount = workouts.filter(w => w.completed).length;
    
    const taskScore = Math.min(completedTasks * 5, 30);
    const goalScore = Math.min(activeGoals * 10, 20);
    const journalScore = Math.min(journalCount * 2, 20);
    const workoutScore = Math.min(workoutCount * 5, 30);
    
    return Math.min(taskScore + goalScore + journalScore + workoutScore, 100);
  }, [tasks, goals, journalEntries, workouts]);
};

export const useActiveGoals = () => {
  const goals = useGoalStore(selectGoals);
  return useMemo(() => goals.filter(g => g.progress < 100), [goals]);
};

export const useOverdueTasks = () => {
  const tasks = useTaskStore(selectTasks);
  return useMemo(() => {
    const now = new Date().toISOString().slice(0, 10);
    return tasks.filter(t => 
      t.status !== 'completed' && 
      t.deadline && 
      t.deadline.slice(0, 10) < now
    );
  }, [tasks]);
};

export const useStudyHoursThisWeek = () => {
  const revisionLogs = useAcademicStore(selectRevisionLogs);
  return useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const thisWeek = revisionLogs.filter(r => r.date >= weekAgo);
    return thisWeek.reduce((sum, r) => sum + (r.hours || 0), 0);
  }, [revisionLogs]);
};

export const useWorkoutConsistency = () => {
  const workouts = useFitnessStore(selectWorkouts);
  return useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const thisWeek = workouts.filter(w => w.date >= weekAgo);
    const completed = thisWeek.filter(w => w.completed).length;
    return {
      total: thisWeek.length,
      completed,
      rate: thisWeek.length > 0 ? Math.round((completed / thisWeek.length) * 100) : 0
    };
  }, [workouts]);
};

export const useJournalConsistency = () => {
  const entries = useJournalStore(selectJournalEntries);
  return useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const thisWeek = entries.filter(e => e.date >= weekAgo);
    return {
      total: thisWeek.length,
      daysActive: new Set(thisWeek.map(e => e.date)).size,
      rate: Math.round((thisWeek.length / 7) * 100)
    };
  }, [entries]);
};

export const useFinanceTrackingStatus = () => {
  const transactions = useFinanceStore(selectTransactions);
  return useMemo(() => {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const thisMonth = transactions.filter(t => t.date >= monthAgo);
    const income = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = thisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return {
      totalTransactions: thisMonth.length,
      income,
      expenses,
      net: income - expenses,
      tracked: thisMonth.length > 0
    };
  }, [transactions]);
};
