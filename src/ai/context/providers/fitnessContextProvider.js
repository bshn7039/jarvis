import { useFitnessStore } from '../../../store/fitnessStore';
import { parseDatesFromPrompt } from './dateContextHelper';

export function getFitnessContext(prompt) {
  const state = useFitnessStore.getState();
  const todayStr = new Date().toISOString().slice(0, 10);

  // Dynamic date matching
  const targetDates = parseDatesFromPrompt(prompt);
  // Default to today if no dates matched
  const activeDates = targetDates.length > 0 ? targetDates : [todayStr];

  // Resolve daily logs for each active date
  const dailyBreakdowns = activeDates.map(date => {
    const dayMeals = (state.meals || []).filter(m => m.date === date);
    const dayHydration = (state.hydrationLogs || []).filter(h => h.date === date);
    const dayWorkouts = (state.workouts || []).filter(w => w.date === date);

    const caloriesConsumed = dayMeals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0);
    const proteinConsumed = dayMeals.reduce((sum, m) => sum + (Number(m.protein) || 0), 0);
    const hydrationVolume = dayHydration.reduce((sum, h) => sum + (Number(h.amountMl) || 0), 0);

    return {
      date,
      totals: {
        calories: caloriesConsumed,
        protein: proteinConsumed,
        hydrationMl: hydrationVolume,
        workoutsCompleted: dayWorkouts.filter(w => w.completed).length,
        workoutsLogged: dayWorkouts.length
      },
      meals: dayMeals.map(m => ({ id: m.id, title: m.title, meal: m.meal, calories: m.calories, protein: m.protein })),
      hydration: dayHydration.map(h => ({ id: h.id, amountMl: h.amountMl })),
      workouts: dayWorkouts.map(w => ({ id: w.id, title: w.title, duration: w.duration, intensity: w.intensity, completed: w.completed }))
    };
  });

  const latestMetric = (state.bodyMetrics || [])
    .sort((a, b) => b.date.localeCompare(a.date))[0] || null;

  // Tiny historic summaries for general context, avoiding duplication
  const recentWorkouts = (state.workouts || [])
    .filter(w => !activeDates.includes(w.date))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)
    .map(w => ({ id: w.id, date: w.date, title: w.title, completed: w.completed }));

  const recentMeals = (state.meals || [])
    .filter(m => !activeDates.includes(m.date))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)
    .map(m => ({ id: m.id, date: m.date, title: m.title, calories: m.calories }));

  return {
    targets: state.targets || {},
    dailyBreakdowns,
    latestBodyMetric: latestMetric ? {
      date: latestMetric.date,
      weightKg: latestMetric.weightKg,
      bodyFat: latestMetric.bodyFat
    } : null,
    recentWorkoutsSummary: recentWorkouts,
    recentMealsSummary: recentMeals
  };
}
