import ProgressBar from '../ui/ProgressBar';

export function MonthlySpendingBars({ monthlySpending }) {
  const max = Math.max(...monthlySpending.map((item) => item.amount), 1);
  return (
    <div className="grid grid-cols-5 gap-2">
      {monthlySpending.map((item) => (
        <div key={item.month} className="text-center">
          <div className="mb-1 flex h-24 items-end justify-center">
            <div
              className="w-8 rounded-t-md bg-jarvis-accent/80"
              style={{ height: `${Math.max(8, (item.amount / max) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-jarvis-muted">{item.month}</p>
        </div>
      ))}
    </div>
  );
}

export function CategoryBreakdown({ categoryBreakdown }) {
  return (
    <div className="space-y-3">
      {categoryBreakdown.map((category) => {
        const pct = Math.round((category.amount / category.budget) * 100);
        return (
          <article key={category.category} className="rounded-xl border border-jarvis-border bg-black/20 p-3">
            <div className="flex items-center justify-between text-sm">
              <p className="text-jarvis-text">{category.category}</p>
              <p className="text-jarvis-muted">
                {category.amount.toLocaleString('en-IN')} / {category.budget.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="mt-2">
              <ProgressBar value={pct} />
              <p className="mt-1 text-[11px] text-jarvis-muted">{pct}% of budget used</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
