import { useFinanceStore } from '../../store/financeStore';

export default function TransactionTable({ transactions }) {
  const deleteTransaction = useFinanceStore(s => s.deleteTransaction);

  return (
    <div className="overflow-x-auto rounded-xl border border-jarvis-border">
      <table className="min-w-full divide-y divide-jarvis-border text-sm">
        <thead className="bg-black/25 text-xs uppercase tracking-wide text-jarvis-muted">
          <tr>
            <th className="px-3 py-2 text-left">Date</th>
            <th className="px-3 py-2 text-left">Type</th>
            <th className="px-3 py-2 text-left">Account</th>
            <th className="px-3 py-2 text-left">Category</th>
            <th className="px-3 py-2 text-left">Note</th>
            <th className="px-3 py-2 text-right">Amount</th>
            <th className="px-3 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-jarvis-border/70">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="bg-black/10 hover:bg-white/5 transition">
              <td className="px-3 py-2 text-jarvis-muted whitespace-nowrap">{transaction.transactionDate || transaction.date}</td>
              <td className="px-3 py-2">
                <span className={[
                  'px-1.5 py-0.5 rounded text-[10px] uppercase font-bold',
                  transaction.type === 'credit' ? 'bg-jarvis-accent/20 text-jarvis-accent' : 'bg-white/10 text-jarvis-text'
                ].join(' ')}>
                  {transaction.type}
                </span>
              </td>
              <td className="px-3 py-2 text-jarvis-text capitalize">{transaction.account}</td>
              <td className="px-3 py-2 text-jarvis-muted">{transaction.category}</td>
              <td className="px-3 py-2 text-jarvis-muted max-w-[200px] truncate" title={transaction.title || transaction.note}>
                {transaction.title || transaction.note}
              </td>
              <td
                className={[
                  'px-3 py-2 text-right font-medium',
                  transaction.type === 'credit' ? 'text-jarvis-accent' : 'text-jarvis-text',
                ].join(' ')}
              >
                {(transaction.amount ?? 0).toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                })}
              </td>
              <td className="px-3 py-2 text-center">
                <button
                  onClick={() => {
                    if (confirm('Delete this transaction?')) {
                      deleteTransaction(transaction.id);
                    }
                  }}
                  className="text-jarvis-muted hover:text-red-400 transition"
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
          {transactions.length === 0 && (
            <tr>
              <td colSpan="7" className="px-3 py-8 text-center text-jarvis-muted">
                No transactions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
