import { useFitnessStore } from '../../../store/fitnessStore';

export function getFitnessContext() {
  const state = useFitnessStore.getState();
  const todayStr = new Date().toISOString().slice(0, 10);

  const todayMeals = (state.meals || []).filter(m => m.date === todayStr);
  const todayHydration = (state.hydrationLogs || []).filter(h => h.date === todayStr);
  const todayWorkouts = (state.workouts || []).filter(w => w.date === todayStr);

  const caloriesConsumed = todayMeals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0);
  const proteinConsumed = todayMeals.reduce((sum, m) => sum + (Number(m.protein) || 0), 0);
  const hydrationVolume = todayHydration.reduce((sum, h) => sum + (Number(h.amountMl) || 0), 0);

  const latestMetric = (state.bodyMetrics || [])
    .sort((a, b) => b.date.localeCompare(a.date))[0] || null;

  const recentWorkouts = (state.workouts || [])
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map(w => ({
      id: w.id,
      date: w.date,
      title: w.title,
      duration: w.duration,
      completed: w.completed,
      intensity: w.intensity
    }));

  const recentMeals = (state.meals || [])
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map(m => ({
      id: m.id,
      date: m.date,
      meal: m.meal,
      title: m.title,
      calories: m.calories,
      protein: m.protein
    }));

  return {
    targets: state.targets || {},
    todayTotals: {
      date: todayStr,
      calories: caloriesConsumed,
      protein: proteinConsumed,
      hydrationMl: hydrationVolume,
      workoutsCompleted: todayWorkouts.filter(w => w.completed).length,
      workoutsLogged: todayWorkouts.length
    },
    latestBodyMetric: latestMetric ? {
      date: latestMetric.date,
      weightKg: latestMetric.weightKg,
      bodyFat: latestMetric.bodyFat
    } : null,
    recentWorkouts,
    recentMeals
  };
}
