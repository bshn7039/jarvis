import { mockDatabase } from '../data/mockDatabase';
import { createPersistedStore } from './persistHelpers';

const initialState = {
  targets: mockDatabase.fitness.targets,
  workouts: mockDatabase.fitness.workouts,
  meals: mockDatabase.fitness.meals,
  hydrationLogs: mockDatabase.fitness.hydrationLogs,
  bodyMetrics: mockDatabase.fitness.bodyMetrics,
  routines: mockDatabase.fitness.routines,
  selectedDay: '2026-05-21',
};

export const useFitnessStore = createPersistedStore({
  name: 'jarvis-fitness',
  initialState,
  partialize: (state) => ({
    targets: state.targets,
    workouts: state.workouts,
    meals: state.meals,
    hydrationLogs: state.hydrationLogs,
    bodyMetrics: state.bodyMetrics,
    routines: state.routines,
    selectedDay: state.selectedDay,
  }),
  actions: (set) => ({
    setSelectedDay: (selectedDay) => set({ selectedDay }),
    toggleWorkoutCompleted: (workoutId) =>
      set((state) => ({
        workouts: state.workouts.map((workout) =>
          workout.id === workoutId
            ? { ...workout, completed: !workout.completed }
            : workout,
        ),
      })),
    addHydrationLog: (amountMl) =>
      set((state) => ({
        hydrationLogs: [
          {
            id: `water-local-${Date.now()}`,
            date: state.selectedDay || '2026-05-21',
            amountMl: Math.max(50, Number(amountMl) || 250),
          },
          ...state.hydrationLogs,
        ],
      })),
    addMealLog: (meal) =>
      set((state) => ({
        meals: [
          {
            id: `meal-local-${Date.now()}`,
            date: state.selectedDay || '2026-05-21',
            meal: meal.meal || 'Snack',
            title: meal.title || 'Manual meal entry',
            calories: Math.max(0, Number(meal.calories) || 0),
            protein: Math.max(0, Number(meal.protein) || 0),
          },
          ...state.meals,
        ],
      })),
  }),
});
