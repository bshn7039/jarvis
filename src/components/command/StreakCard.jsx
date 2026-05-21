export default function StreakCard({ streaks }) {
  return (
    <section className="rounded-2xl border border-jarvis-border bg-jarvis-panel p-5 md:p-6">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-jarvis-muted">
        Streaks
      </h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {streaks.map((streak) => (
          <div
            key={streak.id}
            className="rounded-xl border border-jarvis-border/80 bg-jarvis-bg/40 px-4 py-4 text-center transition-colors duration-200 hover:border-jarvis-muted/30"
          >
            <p className="text-2xl font-medium tabular-nums text-jarvis-text">{streak.days}</p>
            <p className="mt-1 text-xs text-jarvis-muted">Days</p>
            <p className="mt-2 text-sm text-jarvis-text/80">{streak.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
