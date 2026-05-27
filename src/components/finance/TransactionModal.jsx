import { useState } from 'react';
import BaseModal from '../modals/BaseModal';

const DEBIT_CATEGORIES = [
  'Food & Dining',
  'Transport',
  'Entertainment',
  'Health & Medical',
  'Shopping',
  'Bills & Utilities',
  'Education',
  'Subscriptions',
  'Miscellaneous',
];

export default function TransactionModal({ open, onClose, type, onSubmit, onSaveSubmit }) {
  const [formData, setFormData] = useState({
    amount: '',
    title: '',
    category: type === 'debit' ? 'Food & Dining' : (type === 'saving' ? 'Savings Transfer' : 'Income'),
    account: 'cash',
    description: '',
    transactionDate: new Date().toISOString().split('T')[0],
    tags: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'saving') {
      onSaveSubmit({
        amount: Number(formData.amount),
        fromAccount: formData.account,
        transactionDate: formData.transactionDate,
        note: formData.title
      });
    } else {
      onSubmit({
        ...formData,
        amount: Number(formData.amount),
        type,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      });
    }
    onClose();
    setFormData({
      amount: '',
      title: '',
      category: type === 'debit' ? 'Food & Dining' : (type === 'saving' ? 'Savings Transfer' : 'Income'),
      account: 'cash',
      description: '',
      transactionDate: new Date().toISOString().split('T')[0],
      tags: ''
    });
  };

  return (
    <BaseModal open={open} onClose={onClose} ariaLabel={type === 'credit' ? 'Add Credit' : (type === 'saving' ? 'Save Money' : 'Add Debit')}>
      <h2 className="text-lg font-semibold mb-4">
        {type === 'credit' ? '+ Add Credit' : (type === 'saving' ? '💰 Save Money' : '- Add Debit')}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-wide text-jarvis-muted">Amount (₹)</span>
            <input
              type="number"
              required
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text focus:outline-none"
              placeholder="0.00"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-wide text-jarvis-muted">Date</span>
            <input
              type="date"
              required
              value={formData.transactionDate}
              onChange={e => setFormData({ ...formData, transactionDate: e.target.value })}
              className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text focus:outline-none"
            />
          </label>
        </div>

        <label className="block space-y-1">
          <span className="text-xs uppercase tracking-wide text-jarvis-muted">
            {type === 'credit' ? 'Title / Note' : (type === 'saving' ? 'Saving Note' : 'Expense Title')}
          </span>
          <input
            type="text"
            required
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text focus:outline-none"
            placeholder={type === 'credit' ? 'Salary, Gift, Freelance...' : (type === 'saving' ? 'Monthly savings, Emergency fund...' : 'Describe the expense')}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-wide text-jarvis-muted">
              {type === 'saving' ? 'From Account' : 'Account'}
            </span>
            <input
              type="text"
              required
              value={formData.account}
              onChange={e => setFormData({ ...formData, account: e.target.value })}
              className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text focus:outline-none"
              placeholder="cash, upi, bank..."
            />
          </label>
          {type === 'debit' && (
            <label className="block space-y-1">
              <span className="text-xs uppercase tracking-wide text-jarvis-muted">Category</span>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text focus:outline-none"
              >
                {DEBIT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="bg-jarvis-panel">{cat}</option>
                ))}
              </select>
            </label>
          )}
        </div>

        {type !== 'saving' && (
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-wide text-jarvis-muted">Tags (comma separated)</span>
            <input
              type="text"
              value={formData.tags}
              onChange={e => setFormData({ ...formData, tags: e.target.value })}
              className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text focus:outline-none"
              placeholder="personal, work, monthly..."
            />
          </label>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-jarvis-border px-3 py-1.5 text-xs text-jarvis-muted transition hover:text-jarvis-text"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded border border-jarvis-border bg-white/10 px-3 py-1.5 text-xs text-jarvis-text transition hover:bg-white/15"
          >
            Confirm {type === 'credit' ? 'Credit' : (type === 'saving' ? 'Saving' : 'Debit')}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
