import { useMemo, useState } from 'react';
import ModulePageLayout from '../components/layout/ModulePageLayout';
import PagePanel from '../components/ui/PagePanel';
import FinanceOverviewCards from '../components/finance/FinanceOverviewCards';
import { CategoryBreakdown, MonthlySpendingBars } from '../components/finance/ExpenseBreakdown';
import TransactionTable from '../components/finance/TransactionTable';
import TransactionModal from '../components/finance/TransactionModal';
import { useFinanceStore } from '../store/financeStore';

export default function Finance() {
  const transactions = useFinanceStore((s) => s.transactions);
  const selectedTransactionType = useFinanceStore((s) => s.selectedTransactionType);
  const selectedCategory = useFinanceStore((s) => s.selectedCategory);
  const setSelectedTransactionType = useFinanceStore((s) => s.setSelectedTransactionType);
  const setSelectedCategory = useFinanceStore((s) => s.setSelectedCategory);
  const addTransaction = useFinanceStore((s) => s.addTransaction);
  const saveMoney = useFinanceStore((s) => s.saveMoney);
  
  const balanceOverview = useFinanceStore(s => s.balanceOverview);
  const accounts = useFinanceStore(s => s.accounts);
  const monthlyHistory = useFinanceStore(s => s.monthlyHistory);
  const categoryBreakdown = useFinanceStore(s => s.categoryBreakdown);

  const [modalType, setModalType] = useState(null); // 'credit' | 'debit' | 'saving' | null

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const typeOk =
          selectedTransactionType === 'all' || transaction.type === selectedTransactionType;
        const categoryOk =
          selectedCategory === 'all' || transaction.category === selectedCategory;
        return typeOk && categoryOk;
      }),
    [transactions, selectedTransactionType, selectedCategory],
  );

  const categories = useMemo(
    () => ['all', ...new Set(transactions.map((transaction) => transaction.category))],
    [transactions],
  );

  return (
    <ModulePageLayout title="Finance" subtitle="Transaction-driven operational ledger.">
      <PagePanel 
        title="Balance Overview"
        actions={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setModalType('credit')}
              className="rounded-lg border border-jarvis-border bg-jarvis-accent/10 px-3 py-1.5 text-xs text-jarvis-accent transition hover:bg-jarvis-accent/20"
            >
              + CREDIT
            </button>
            <button
              type="button"
              onClick={() => setModalType('debit')}
              className="rounded-lg border border-jarvis-border bg-white/5 px-3 py-1.5 text-xs text-jarvis-text transition hover:bg-white/10"
            >
              - DEBIT
            </button>
            <button
              type="button"
              onClick={() => setModalType('saving')}
              className="rounded-lg border border-jarvis-border bg-jarvis-accent/20 px-3 py-1.5 text-xs text-jarvis-accent transition hover:bg-jarvis-accent/30"
            >
              $ SAVING
            </button>
          </div>
        }
      >
        <FinanceOverviewCards overview={balanceOverview} />
      </PagePanel>

      <div className="grid gap-4 xl:grid-cols-2">
        <PagePanel title="Active Accounts">
          <div className="grid gap-3 sm:grid-cols-2">
            {accounts.map(acc => (
              <article key={acc.name} className="rounded-xl border border-jarvis-border bg-black/20 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-jarvis-text capitalize">{acc.name}</p>
                  <p className={acc.balance >= 0 ? 'text-jarvis-accent text-sm' : 'text-red-400 text-sm'}>
                    {acc.balance.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-jarvis-muted">
                  <span>In: {acc.credits.toLocaleString('en-IN')}</span>
                  <span>Out: {acc.debits.toLocaleString('en-IN')}</span>
                </div>
              </article>
            ))}
            {accounts.length === 0 && (
              <p className="text-xs text-jarvis-muted py-4 text-center col-span-2">No active accounts yet. Add a transaction to begin.</p>
            )}
          </div>
        </PagePanel>

        <PagePanel title="History Overview">
          <MonthlySpendingBars monthlySpending={monthlyHistory} />
        </PagePanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <PagePanel title="Category Breakdown (Current Month)">
            <CategoryBreakdown categoryBreakdown={categoryBreakdown.map(c => ({ ...c, budget: 10000 }))} />
          </PagePanel>
        </div>
        
        <div className="xl:col-span-2">
          <PagePanel title="Transactions" subtitle="Recent history and ledger logs.">
            <div className="mb-3 flex flex-wrap gap-2">
              <select
                value={selectedTransactionType}
                onChange={(event) => setSelectedTransactionType(event.target.value)}
                className="rounded-lg border border-jarvis-border bg-black/20 px-2.5 py-1.5 text-xs text-jarvis-text focus:outline-none"
              >
                <option value="all" className="bg-jarvis-panel">All Types</option>
                <option value="debit" className="bg-jarvis-panel">Debit</option>
                <option value="credit" className="bg-jarvis-panel">Credit</option>
              </select>
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="rounded-lg border border-jarvis-border bg-black/20 px-2.5 py-1.5 text-xs text-jarvis-text focus:outline-none"
              >
                {categories.map((category) => (
                  <option key={category} value={category} className="bg-jarvis-panel">
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            <TransactionTable transactions={filteredTransactions} />
          </PagePanel>
        </div>
      </div>

      <TransactionModal 
        open={!!modalType} 
        onClose={() => setModalType(null)} 
        type={modalType} 
        onSubmit={addTransaction}
        onSaveSubmit={saveMoney}
      />
    </ModulePageLayout>
  );
}
