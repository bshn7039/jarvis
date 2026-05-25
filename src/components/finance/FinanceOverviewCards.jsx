export default function FinanceOverviewCards({ overview }) {
  const cards = [
    { id: 'total', label: 'Total Balance', value: overview?.totalBalance ?? 0 },
    { id: 'spending', label: 'Monthly Spending', value: overview?.monthlySpending ?? 0 },
    { id: 'credits', label: 'Monthly Credits', value: overview?.monthlyCredits ?? 0 },
    { id: 'savings', label: 'Savings Total', value: overview?.savingsTotal ?? 0 },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.id} className="rounded-xl border border-jarvis-border bg-black/20 p-4">
          <p className="text-xs uppercase tracking-wide text-jarvis-muted">{card.label}</p>
          <p className="mt-2 text-xl text-jarvis-text">
            {(card.value ?? 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
          </p>
        </article>
      ))}
    </div>
  );
}
