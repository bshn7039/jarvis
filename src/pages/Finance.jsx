import { useMemo, useState, useEffect } from 'react';
import ModulePageLayout from '../components/layout/ModulePageLayout';
import PagePanel from '../components/ui/PagePanel';
import FinanceOverviewCards from '../components/finance/FinanceOverviewCards';
import { SpendingsBreakdown, MonthlySpendingBars } from '../components/finance/ExpenseBreakdown';
import TransactionTable from '../components/finance/TransactionTable';
import TransactionModal from '../components/finance/TransactionModal';
import MutualFundTracker from '../components/finance/MutualFundTracker';
import MutualFundModal from '../components/finance/MutualFundModal';
import { useFinanceStore } from '../store/financeStore';
import { useMutualFundStore } from '../store/mutualFundStore';

export default function Finance() {
  const transactions = useFinanceStore((s) => s.transactions);
  const selectedTransactionType = useFinanceStore((s) => s.selectedTransactionType);
  const selectedCategory = useFinanceStore((s) => s.selectedCategory);
  const setSelectedTransactionType = useFinanceStore((s) => s.setSelectedTransactionType);
  const setSelectedCategory = useFinanceStore((s) => s.setSelectedCategory);
  const addTransaction = useFinanceStore((s) => s.addTransaction);
  const saveMoney = useFinanceStore((s) => s.saveMoney);
  const updateTransaction = useFinanceStore((s) => s.updateTransaction);
  
  const balanceOverview = useFinanceStore(s => s.balanceOverview);
  const accounts = useFinanceStore(s => s.accounts);
  const monthlyHistory = useFinanceStore(s => s.monthlyHistory);
  const categoryBreakdown = useFinanceStore(s => s.categoryBreakdown);

  const hydrateMF = useMutualFundStore(s => s.hydrate);
  const isMFHydrated = useMutualFundStore(s => s.isHydrated);

  const [modalType, setModalType] = useState(null); // 'credit' | 'debit' | 'saving' | 'mf' | null
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'mf'

  // Hydrate MF store on mount
  useEffect(() => {
    if (!isMFHydrated) hydrateMF();
  }, [isMFHydrated, hydrateMF]);

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

  // Savings total for Spendings panel (Savings Transfer debits = savings moved out)
  const savingsTotal = useMemo(() => {
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    return transactions
      .filter(t => t.type === 'debit' && t.category === 'Savings Transfer' && (t.transactionDate || '').startsWith(currentMonth))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [transactions]);

  return (
    <ModulePageLayout title="Finance" subtitle="Transaction-driven operational ledger.">
      {/* Tab switcher */}
      <div className="flex gap-1 rounded-xl border border-jarvis-border bg-jarvis-panel p-1 w-fit mb-2">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={[
            'rounded-lg px-4 py-1.5 text-xs font-medium transition',
            activeTab === 'overview'
              ? 'bg-jarvis-accent/20 text-jarvis-accent border border-jarvis-accent/30'
              : 'text-jarvis-muted hover:text-jarvis-text',
          ].join(' ')}
        >
          💳 Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('mf')}
          className={[
            'rounded-lg px-4 py-1.5 text-xs font-medium transition',
            activeTab === 'mf'
              ? 'bg-jarvis-accent/20 text-jarvis-accent border border-jarvis-accent/30'
              : 'text-jarvis-muted hover:text-jarvis-text',
          ].join(' ')}
        >
          📈 Mutual Funds
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
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
                  💰 SAVING
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
              <PagePanel title="Spendings" subtitle="This month's debit breakdown">
                <SpendingsBreakdown
                  categoryBreakdown={categoryBreakdown}
                  savingsTotal={savingsTotal}
                />
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
                <TransactionTable transactions={filteredTransactions} onEdit={setEditingTransaction} />
              </PagePanel>
            </div>
          </div>
        </>
      )}

      {activeTab === 'mf' && (
        <MutualFundTracker onAddFund={() => setModalType('mf')} />
      )}

      <TransactionModal 
        open={(!!modalType && modalType !== 'mf') || !!editingTransaction} 
        onClose={() => {
          setModalType(null);
          setEditingTransaction(null);
        }} 
        type={editingTransaction ? editingTransaction.type : modalType} 
        transaction={editingTransaction}
        onSubmit={editingTransaction ? (data) => updateTransaction(editingTransaction.id, data) : addTransaction}
        onSaveSubmit={saveMoney}
      />

      <MutualFundModal
        open={modalType === 'mf'}
        onClose={() => setModalType(null)}
      />
    </ModulePageLayout>
  );
}
