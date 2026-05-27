import ProgressBar from '../ui/ProgressBar';

const CATEGORY_ICONS = {
  'Food & Dining': '🍽️',
  'Transport': '🚌',
  'Entertainment': '🎮',
  'Health & Medical': '💊',
  'Shopping': '🛍️',
  'Bills & Utilities': '📋',
  'Education': '📚',
  'Subscriptions': '🔄',
  'Savings Transfer': '💰',
  'Miscellaneous': '📦',
};

export function MonthlySpendingBars({ monthlySpending }) {
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

export function SpendingsBreakdown({ categoryBreakdown, savingsTotal = 0 }) {
  // Only debit categories (no Savings Transfer)
  const spendingCategories = categoryBreakdown.filter(c => c.category !== 'Savings Transfer');
  const total = spendingCategories.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-2">
      {spendingCategories.length === 0 && savingsTotal === 0 ? (
        <p className="py-8 text-center text-xs text-jarvis-muted italic">No spending this month.</p>
      ) : (
        <>
          {spendingCategories.map((category) => {
            const pct = total > 0 ? Math.round((category.amount / total) * 100) : 0;
            const icon = CATEGORY_ICONS[category.category] || '📦';
            return (
              <article key={category.category} className="rounded-xl border border-jarvis-border bg-black/20 p-3">
                <div className="flex items-center justify-between text-sm mb-2">
                  <p className="text-jarvis-text flex items-center gap-2">
                    <span>{icon}</span>
                    <span>{category.category}</span>
                  </p>
                  <div className="text-right">
                    <p className="text-jarvis-text font-medium text-xs">
                      ₹{category.amount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-jarvis-muted">{pct}% of spend</p>
                  </div>
                </div>
                <ProgressBar progress={pct} height={4} />
              </article>
            );
          })}

          {/* Savings row */}
          {savingsTotal > 0 && (
            <article className="rounded-xl border border-jarvis-accent/30 bg-jarvis-accent/5 p-3">
              <div className="flex items-center justify-between text-sm">
                <p className="text-jarvis-accent flex items-center gap-2">
                  <span>💰</span>
                  <span>Savings</span>
                </p>
                <div className="text-right">
                  <p className="text-jarvis-accent font-medium text-xs">
                    ₹{savingsTotal.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-jarvis-muted">transferred to savings</p>
                </div>
              </div>
            </article>
          )}
        </>
      )}
    </div>
  );
}

// Keep old export for backwards compat
export function CategoryBreakdown({ categoryBreakdown }) {
  return <SpendingsBreakdown categoryBreakdown={categoryBreakdown} />;
}
