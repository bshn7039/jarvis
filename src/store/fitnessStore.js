import { create } from 'zustand';
import { fitnessService } from '../database/services/fitnessService';
import { localDb } from '../database/core/localDatabase';
import { deepClone } from '../utils/deepClone';
import { useActivityStore } from './activityStore';

const initialState = {
  targets: {
    calories: 2500,
    protein: 140,
    hydrationMl: 3500,
    weeklyWorkouts: 5,
  },
  workouts: [],
  meals: [],
  hydrationLogs: [],
  bodyMetrics: [],
  routines: [],
  selectedDay: '2026-05-21',
  isHydrated: false,
};

export const useFitnessStore = create((set, get) => ({
  ...deepClone(initialState),

  hydrate: async () => {
    try {
      const logs = await fitnessService.getAll();
      const routines = await localDb.getAll('fitnessRoutines');
      
      set({ 
        workouts: logs.filter(l => l.type === 'workout'),
        meals: logs.filter(l => l.type === 'meal'),
        hydrationLogs: logs.filter(l => l.type === 'hydration'),
        bodyMetrics: logs.filter(l => l.type === 'bodyMetric'),
        routines,
        isHydrated: true 
      });
    } catch (err) {
      console.error('Failed to hydrate fitness:', err);
    }
  },

  setSelectedDay: (selectedDay) => set({ selectedDay }),
  
  logActivity: async ({ action, entityId, metadata = {} }) => {
    const activityStore = useActivityStore.getState();
    await activityStore.logActivity({
      type: 'fitness',
      action,
      entityType: 'workout',
      entityId,
      metadata
    });
  },

  toggleWorkoutCompleted: async (workoutId) => {
    const workouts = get().workouts;
    const workout = workouts.find(w => w.id === workoutId);
    if (!workout) return;

    const updatedWorkout = { ...workout, completed: !workout.completed };
    await fitnessService.update(workoutId, updatedWorkout);
    set({ workouts: workouts.map(w => w.id === workoutId ? updatedWorkout : w) });
    await get().logActivity({ 
      action: updatedWorkout.completed ? 'completed' : 'reopened', 
      entityId: workoutId,
      metadata: { title: workout.title }
    });
  },

  addHydrationLog: async (amountMl) => {
    const next = {
      type: 'hydration',
      date: get().selectedDay || '2026-05-21',
      amountMl: Math.max(50, Number(amountMl) || 250),
    };
    
    const savedLog = await fitnessService.create(next);
    set((state) => ({
      hydrationLogs: [savedLog, ...state.hydrationLogs],
    }));
    await get().logActivity({ 
      action: 'created', 
      entityId: savedLog.id,
      metadata: { amountMl: savedLog.amountMl }
    });
  },

  addMealLog: async (mealData) => {
    const next = {
      type: 'meal',
      date: get().selectedDay || '2026-05-21',
      meal: mealData.meal || 'Snack',
      title: mealData.title || 'Manual meal entry',
      calories: Math.max(0, Number(mealData.calories) || 0),
      protein: Math.max(0, Number(mealData.protein) || 0),
    };
    
    const savedLog = await fitnessService.create(next);
    set((state) => ({
      meals: [savedLog, ...state.meals],
    }));
    await get().logActivity({ 
      action: 'created', 
      entityId: savedLog.id,
      metadata: { meal: savedLog.meal, calories: savedLog.calories }
    });
  },

  addWorkoutLog: async (workoutData) => {
    const next = {
      type: 'workout',
      date: get().selectedDay || '2026-05-21',
      title: workoutData.title || 'New Workout',
      duration: workoutData.duration || '45m',
      completed: false,
      intensity: workoutData.intensity || 'Medium',
      exercises: workoutData.exercises || []
    };
    
    const savedLog = await fitnessService.create(next);
    set((state) => ({
      workouts: [savedLog, ...state.workouts],
    }));
    await get().logActivity({ 
      action: 'created', 
      entityId: savedLog.id,
      metadata: { title: savedLog.title, duration: savedLog.duration }
    });
  },

  addBodyMetricLog: async (metricData) => {
    const next = {
      type: 'bodyMetric',
      date: get().selectedDay || '2026-05-21',
      weightKg: Number(metricData.weightKg) || 0,
      bodyFat: Number(metricData.bodyFat) || 0,
      waistCm: Number(metricData.waistCm) || 0,
    };
    
    const savedLog = await fitnessService.create(next);
    set((state) => ({
      bodyMetrics: [savedLog, ...state.bodyMetrics],
    }));
  },

  deleteLog: async (id) => {
    const item = [...get().workouts, ...get().meals, ...get().hydrationLogs, ...get().bodyMetrics].find(i => i.id === id);
    if (!item) return;

    await fitnessService.delete(id);
    set((state) => ({
      workouts: state.workouts.filter(w => w.id !== id),
      meals: state.meals.filter(m => m.id !== id),
      hydrationLogs: state.hydrationLogs.filter(h => h.id !== id),
      bodyMetrics: state.bodyMetrics.filter(b => b.id !== id),
    }));
    await get().logActivity({ 
      action: 'deleted', 
      entityId: id,
      metadata: { type: item.type, title: item.title || item.meal || item.type }
    });
  },

  updateBodyMetricLog: async (id, updates) => {
    const metrics = get().bodyMetrics;
    const metric = metrics.find(m => m.id === id);
    if (!metric) return;

    const updated = { ...metric, ...updates, updatedAt: new Date().toISOString() };
    await fitnessService.update(id, updated);
    set({ bodyMetrics: metrics.map(m => m.id === id ? updated : m) });
  },

  updateMealLog: async (id, updates) => {
    const meals = get().meals;
    const meal = meals.find(m => m.id === id);
    if (!meal) return;

    const updated = { ...meal, ...updates, updatedAt: new Date().toISOString() };
    await fitnessService.update(id, updated);
    set({ meals: meals.map(m => m.id === id ? updated : m) });
  },

  updateWorkoutLog: async (id, updates) => {
    const workouts = get().workouts;
    const workout = workouts.find(w => w.id === id);
    if (!workout) return;

    const updated = { ...workout, ...updates, updatedAt: new Date().toISOString() };
    await fitnessService.update(id, updated);
    set({ workouts: workouts.map(w => w.id === id ? updated : w) });
  },
}));

