import ProgressBar from '../ui/ProgressBar';

export function MonthlySpendingBars({ monthlySpending }) {
  // monthlySpending is now monthlyHistory with { month, credited, debited, saved }
  const max = Math.max(
    ...monthlySpending.map((item) => Math.max(item.credited, item.debited, item.saved)),
    1
  );

  return (
    <div className="flex flex-wrap gap-6 justify-around py-2">
      {monthlySpending.map((item) => (
        <div key={item.key} className="flex flex-col items-center">
          <div className="flex h-32 items-end gap-1 px-2 border-b border-jarvis-border/40 pb-1">
            {/* Credited (Income) */}
            <div
              className="w-4 rounded-t-sm bg-jarvis-accent/60 transition-all hover:bg-jarvis-accent/80"
              style={{ height: `${(item.credited / max) * 100}%` }}
              title={`Credited: ${item.credited.toLocaleString()}`}
            />
            {/* Debited (Expenses) */}
            <div
              className="w-4 rounded-t-sm bg-white/20 transition-all hover:bg-white/30"
              style={{ height: `${(item.debited / max) * 100}%` }}
              title={`Debited: ${item.debited.toLocaleString()}`}
            />
            {/* Saved */}
            <div
              className="w-4 rounded-t-sm bg-jarvis-accent/90 transition-all hover:bg-jarvis-accent"
              style={{ height: `${(item.saved / max) * 100}%` }}
              title={`Saved: ${item.saved.toLocaleString()}`}
            />
          </div>
          <p className="mt-2 text-[11px] font-medium text-jarvis-text">{item.month}</p>
          <div className="mt-1 flex flex-col items-center gap-0.5 opacity-60">
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-jarvis-accent/60" />
              <span className="text-[9px] text-jarvis-muted">In</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
              <span className="text-[9px] text-jarvis-muted">Out</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-jarvis-accent/90" />
              <span className="text-[9px] text-jarvis-muted">Saved</span>
            </div>
          </div>
        </div>
      ))}
      {monthlySpending.length === 0 && (
        <p className="py-8 text-xs text-jarvis-muted italic">No historical data available yet.</p>
      )}
    </div>
  );
}

export function CategoryBreakdown({ categoryBreakdown }) {
  return (
    <div className="space-y-3">
      {categoryBreakdown.map((category) => {
        const amount = category.amount ?? 0;
        const budget = category.budget || 1;
        const pct = Math.round((amount / budget) * 100);
        return (
          <article key={category.category} className="rounded-xl border border-jarvis-border bg-black/20 p-3">
            <div className="flex items-center justify-between text-sm">
              <p className="text-jarvis-text">{category.category}</p>
              <p className="text-jarvis-muted">
                {amount.toLocaleString('en-IN')} / {budget.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="mt-2">
              <ProgressBar progress={pct} height={6} />
              <p className="mt-1 text-[11px] text-jarvis-muted">{pct}% of budget used</p>
            </div>
          </article>
        );
      })}
      {categoryBreakdown.length === 0 && (
        <p className="py-8 text-center text-xs text-jarvis-muted italic">No spending categories this month.</p>
      )}
    </div>
  );
}
