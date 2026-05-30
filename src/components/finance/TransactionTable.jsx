import { useState, useMemo } from 'react';
import { useFinanceStore } from '../../store/financeStore';
import { Trash2, Pencil } from 'lucide-react';

export default function TransactionTable({ transactions, onEdit }) {
  const deleteTransaction = useFinanceStore(s => s.deleteTransaction);
  const deleteTransactions = useFinanceStore(s => s.deleteTransactions);

  const [selectedIds, setSelectedIds] = useState(new Set());

  // Determine if all filtered transactions in the current view are selected
  const areAllSelected = useMemo(() => {
    if (transactions.length === 0) return false;
    return transactions.every(t => selectedIds.has(t.id));
  }, [transactions, selectedIds]);

  const areSomeSelected = useMemo(() => {
    if (transactions.length === 0) return false;
    return transactions.some(t => selectedIds.has(t.id)) && !areAllSelected;
  }, [transactions, selectedIds, areAllSelected]);

  const handleToggleSelectAll = () => {
    if (areAllSelected) {
      // Clear selection of transactions that are currently in the view
      setSelectedIds(prev => {
        const next = new Set(prev);
        transactions.forEach(t => next.delete(t.id));
        return next;
      });
    } else {
      // Select all transactions currently in the view
      setSelectedIds(prev => {
        const next = new Set(prev);
        transactions.forEach(t => next.add(t.id));
        return next;
      });
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    const list = Array.from(selectedIds).filter(id => transactions.some(t => t.id === id));
    if (list.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${list.length} selected transaction(s)?`)) {
      await deleteTransactions(list);
      setSelectedIds(prev => {
        const next = new Set(prev);
        list.forEach(id => next.delete(id));
        return next;
      });
    }
  };

  const handleDeleteAllFiltered = async () => {
    if (transactions.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ALL ${transactions.length} transactions currently shown?`)) {
      const list = transactions.map(t => t.id);
      await deleteTransactions(list);
      setSelectedIds(prev => {
        const next = new Set(prev);
        list.forEach(id => next.delete(id));
        return next;
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* Sleek Action Bar for multi-select */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-jarvis-border bg-jarvis-panel/40 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-jarvis-text">
            {selectedIds.size > 0 
              ? `${selectedIds.size} transactions selected` 
              : 'Bulk Operations'
            }
          </span>
          {selectedIds.size > 0 && (
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-[10px] text-jarvis-muted hover:text-jarvis-text transition"
            >
              Clear selection
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition font-medium"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Selected
            </button>
          )}
          {transactions.length > 0 && (
            <button
              onClick={handleDeleteAllFiltered}
              className="flex items-center gap-1.5 rounded-lg border border-jarvis-border bg-white/5 px-3 py-1.5 text-xs text-jarvis-muted hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete All Shown ({transactions.length})
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-jarvis-border">
        <table className="min-w-full divide-y divide-jarvis-border text-sm">
          <thead className="bg-black/25 text-xs uppercase tracking-wide text-jarvis-muted">
            <tr>
              <th className="px-3 py-2 text-center w-10">
                <input 
                  type="checkbox" 
                  checked={areAllSelected}
                  ref={el => {
                    if (el) {
                      el.indeterminate = areSomeSelected;
                    }
                  }}
                  onChange={handleToggleSelectAll} 
                  className="rounded border-jarvis-border bg-black/20 text-jarvis-accent focus:ring-0 focus:ring-offset-0 cursor-pointer" 
                />
              </th>
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
            {transactions.map((transaction) => {
              const isSelected = selectedIds.has(transaction.id);
              return (
                <tr 
                  key={transaction.id} 
                  className={[
                    'transition border-b border-jarvis-border/40 last:border-0',
                    isSelected ? 'bg-jarvis-accent/5 hover:bg-jarvis-accent/10' : 'bg-black/10 hover:bg-white/5'
                  ].join(' ')}
                >
                  <td className="px-3 py-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => handleToggleSelect(transaction.id)} 
                      className="rounded border-jarvis-border bg-black/20 text-jarvis-accent focus:ring-0 focus:ring-offset-0 cursor-pointer" 
                    />
                  </td>
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
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit?.(transaction)}
                        className="text-jarvis-muted hover:text-jarvis-accent transition"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this transaction?')) {
                            deleteTransaction(transaction.id);
                          }
                        }}
                        className="text-jarvis-muted hover:text-red-400 transition"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {transactions.length === 0 && (
              <tr>
                <td colSpan="8" className="px-3 py-8 text-center text-jarvis-muted">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
