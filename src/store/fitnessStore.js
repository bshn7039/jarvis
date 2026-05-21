import { create } from 'zustand';
import { fitnessService } from '../database/services/fitnessService';
import { deepClone } from '../utils/deepClone';

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
  
  toggleWorkoutCompleted: async (workoutId) => {
    const workouts = get().workouts;
    const workout = workouts.find(w => w.id === workoutId);
    if (!workout) return;

    const updatedWorkout = { ...workout, completed: !workout.completed };
    await fitnessService.update(workoutId, updatedWorkout);
    set({ workouts: workouts.map(w => w.id === workoutId ? updatedWorkout : w) });
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
}));

