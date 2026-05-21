import ProgressBar from '../ui/ProgressBar';

export default function NutritionPanel({ meals, targets, caloriesToday, proteinToday }) {
  const caloriesPct = Math.round((caloriesToday / targets.calories) * 100);
  const proteinPct = Math.round((proteinToday / targets.protein) * 100);

  return (
    <div className="space-y-3">
      <article className="rounded-xl border border-jarvis-border bg-black/20 p-3">
        <p className="text-xs text-jarvis-muted">Calories</p>
        <ProgressBar value={caloriesPct} className="mt-2" />
        <p className="mt-1 text-xs text-jarvis-muted">{caloriesPct}% of daily target</p>
      </article>
      <article className="rounded-xl border border-jarvis-border bg-black/20 p-3">
        <p className="text-xs text-jarvis-muted">Protein</p>
        <ProgressBar value={proteinPct} className="mt-2" />
        <p className="mt-1 text-xs text-jarvis-muted">{proteinPct}% of daily target</p>
      </article>
      <div className="space-y-2">
        {meals.map((meal) => (
          <article key={meal.id} className="rounded-lg border border-jarvis-border bg-black/20 p-2.5">
            <p className="text-xs text-jarvis-text">
              {meal.meal}: {meal.title}
            </p>
            <p className="mt-1 text-[11px] text-jarvis-muted">
              {meal.calories} kcal | {meal.protein}g protein
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
