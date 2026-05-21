import { useMemo } from 'react';
import ModulePageLayout from '../components/layout/ModulePageLayout';
import PagePanel from '../components/ui/PagePanel';
import FitnessSummaryCards from '../components/fitness/FitnessSummaryCards';
import WorkoutList from '../components/fitness/WorkoutList';
import NutritionPanel from '../components/fitness/NutritionPanel';
import ProgressBar from '../components/ui/ProgressBar';
import { useFitnessStore } from '../store/fitnessStore';

export default function Fitness() {
  const targets = useFitnessStore((s) => s.targets);
  const workouts = useFitnessStore((s) => s.workouts);
  const meals = useFitnessStore((s) => s.meals);
  const hydrationLogs = useFitnessStore((s) => s.hydrationLogs);
  const bodyMetrics = useFitnessStore((s) => s.bodyMetrics);
  const routines = useFitnessStore((s) => s.routines);
  const selectedDay = useFitnessStore((s) => s.selectedDay);
  const setSelectedDay = useFitnessStore((s) => s.setSelectedDay);
  const toggleWorkoutCompleted = useFitnessStore((s) => s.toggleWorkoutCompleted);
  const addHydrationLog = useFitnessStore((s) => s.addHydrationLog);
  const addWorkoutLog = useFitnessStore((s) => s.addWorkoutLog);
  const addMealLog = useFitnessStore((s) => s.addMealLog);

  const mealsForDay = useMemo(() => meals.filter((meal) => meal.date === selectedDay), [meals, selectedDay]);
  const hydrationForDay = useMemo(
    () => hydrationLogs.filter((log) => log.date === selectedDay),
    [hydrationLogs, selectedDay],
  );
  const workoutsForWeek = useMemo(() => workouts.slice(0, 5), [workouts]);
  const caloriesToday = mealsForDay.reduce((acc, meal) => acc + meal.calories, 0);
  const proteinToday = mealsForDay.reduce((acc, meal) => acc + meal.protein, 0);
  const hydrationToday = hydrationForDay.reduce((acc, log) => acc + log.amountMl, 0);
  const completedWorkouts = workouts.filter((workout) => workout.completed).length;
  const consistencyPct = Math.round((completedWorkouts / Math.max(workouts.length, 1)) * 100);
  const latestMetrics = bodyMetrics[0];

  return (
    <ModulePageLayout title="Fitness" subtitle="Health operating system with workouts, nutrition, and recovery.">
      <PagePanel title="Daily Fitness Summary">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <label className="text-xs text-jarvis-muted">
            Day
            <input
              type="date"
              value={selectedDay}
              onChange={(event) => setSelectedDay(event.target.value)}
              className="ml-2 rounded-lg border border-jarvis-border bg-black/20 px-2 py-1 text-xs text-jarvis-text focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => addHydrationLog(300)}
            className="rounded-lg border border-jarvis-border bg-white/5 px-2.5 py-1 text-xs text-jarvis-text"
          >
            +300ml Water
          </button>
          <button
            type="button"
            onClick={() => addWorkoutLog({ title: 'New Workout', intensity: 'High' })}
            className="rounded-lg border border-jarvis-border bg-white/5 px-2.5 py-1 text-xs text-jarvis-text"
          >
            Log Workout
          </button>
          <button
            type="button"
            onClick={() => addMealLog({ title: 'Quick Snack', calories: 200, protein: 10 })}
            className="rounded-lg border border-jarvis-border bg-white/5 px-2.5 py-1 text-xs text-jarvis-text"
          >
            Log Meal
          </button>
        </div>
        <FitnessSummaryCards
          targets={targets}
          caloriesToday={caloriesToday}
          proteinToday={proteinToday}
          hydrationToday={hydrationToday}
        />
      </PagePanel>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <PagePanel title="Workouts" subtitle="Routine logs, intensity, and consistency.">
          <WorkoutList workouts={workoutsForWeek} onToggleCompleted={toggleWorkoutCompleted} />
          <div className="mt-3 rounded-xl border border-jarvis-border bg-black/20 p-3">
            <p className="text-xs text-jarvis-muted">Weekly consistency</p>
            <ProgressBar value={consistencyPct} className="mt-2" />
            <p className="mt-1 text-xs text-jarvis-muted">{consistencyPct}% completed</p>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {routines.map((routine) => (
              <p key={routine.day} className="rounded-lg border border-jarvis-border bg-black/20 p-2 text-xs text-jarvis-muted">
                {routine.day}: {routine.plan}
              </p>
            ))}
          </div>
        </PagePanel>

        <PagePanel title="Nutrition and Metrics">
          <NutritionPanel
            meals={mealsForDay}
            targets={targets}
            caloriesToday={caloriesToday}
            proteinToday={proteinToday}
          />
          {latestMetrics && (
            <div className="mt-3 rounded-xl border border-jarvis-border bg-black/20 p-3 text-xs text-jarvis-muted">
              <p>Latest body metrics ({latestMetrics.date})</p>
              <p className="mt-1">Weight: {latestMetrics.weightKg}kg | Body Fat: {latestMetrics.bodyFat}%</p>
              <p className="mt-1">Waist: {latestMetrics.waistCm}cm</p>
            </div>
          )}
        </PagePanel>
      </div>
    </ModulePageLayout>
  );
}
