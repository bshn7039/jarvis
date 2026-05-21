import { Circle, CircleCheck } from 'lucide-react';

export default function WorkoutList({ workouts, onToggleCompleted }) {
  return (
    <div className="space-y-2">
      {workouts.map((workout) => (
        <article key={workout.id} className="rounded-xl border border-jarvis-border bg-black/20 p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm text-jarvis-text">{workout.type}</p>
              <p className="mt-1 text-xs text-jarvis-muted">
                {workout.date} | {workout.durationMin} min | {workout.caloriesBurned} kcal
              </p>
            </div>
            <button
              type="button"
              onClick={() => onToggleCompleted(workout.id)}
              className="text-jarvis-muted transition hover:text-jarvis-accent"
              aria-label="Toggle workout completion"
            >
              {workout.completed ? (
                <CircleCheck className="h-4 w-4 text-jarvis-accent" strokeWidth={1.75} />
              ) : (
                <Circle className="h-4 w-4" strokeWidth={1.75} />
              )}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
