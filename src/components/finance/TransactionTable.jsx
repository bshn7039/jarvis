export default function TransactionTable({ transactions }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-jarvis-border">
      <table className="min-w-full divide-y divide-jarvis-border text-sm">
        <thead className="bg-black/25 text-xs uppercase tracking-wide text-jarvis-muted">
          <tr>
            <th className="px-3 py-2 text-left">Date</th>
            <th className="px-3 py-2 text-left">Type</th>
            <th className="px-3 py-2 text-left">Category</th>
            <th className="px-3 py-2 text-left">Note</th>
            <th className="px-3 py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-jarvis-border/70">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="bg-black/10">
              <td className="px-3 py-2 text-jarvis-muted">{transaction.date}</td>
              <td className="px-3 py-2 text-jarvis-text">{transaction.type}</td>
              <td className="px-3 py-2 text-jarvis-muted">{transaction.category}</td>
              <td className="px-3 py-2 text-jarvis-muted">{transaction.note}</td>
              <td
                className={[
                  'px-3 py-2 text-right',
                  transaction.type === 'income' ? 'text-jarvis-accent' : 'text-jarvis-text',
                ].join(' ')}
              >
                {(transaction.amount ?? 0).toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
