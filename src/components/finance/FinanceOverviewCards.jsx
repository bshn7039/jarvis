export default function FinanceOverviewCards({ overview }) {
  const cards = [
    { id: 'total', label: 'Total Balance', value: overview?.totalBalance ?? 0 },
    { id: 'checking', label: 'Checking', value: overview?.checking ?? 0 },
    { id: 'savings', label: 'Savings', value: overview?.savings ?? 0 },
    { id: 'cash', label: 'Cash', value: overview?.cash ?? 0 },
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
