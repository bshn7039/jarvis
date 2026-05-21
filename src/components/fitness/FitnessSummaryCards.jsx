export default function FitnessSummaryCards({ targets, caloriesToday, proteinToday, hydrationToday }) {
  const cards = [
    { label: 'Calories', value: `${caloriesToday} / ${targets.calories}` },
    { label: 'Protein', value: `${proteinToday}g / ${targets.protein}g` },
    { label: 'Hydration', value: `${hydrationToday}ml / ${targets.hydrationMl}ml` },
    { label: 'Weekly Workouts', value: `${targets.weeklyWorkouts} target` },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className="rounded-xl border border-jarvis-border bg-black/20 p-4">
          <p className="text-xs uppercase tracking-wide text-jarvis-muted">{card.label}</p>
          <p className="mt-2 text-lg text-jarvis-text">{card.value}</p>
        </article>
      ))}
    </div>
  );
}
