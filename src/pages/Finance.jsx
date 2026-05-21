import { useMemo } from 'react';
import ModulePageLayout from '../components/layout/ModulePageLayout';
import PagePanel from '../components/ui/PagePanel';
import FinanceOverviewCards from '../components/finance/FinanceOverviewCards';
import { CategoryBreakdown, MonthlySpendingBars } from '../components/finance/ExpenseBreakdown';
import TransactionTable from '../components/finance/TransactionTable';
import ProgressBar from '../components/ui/ProgressBar';
import { useFinanceStore } from '../store/financeStore';
export default function Finance() {
  const balanceOverview = useFinanceStore((s) => s.balanceOverview);
  const transactions = useFinanceStore((s) => s.transactions);
  const savingsGoals = useFinanceStore((s) => s.savingsGoals);
  const selectedTransactionType = useFinanceStore((s) => s.selectedTransactionType);
  const selectedCategory = useFinanceStore((s) => s.selectedCategory);
  const setSelectedTransactionType = useFinanceStore((s) => s.setSelectedTransactionType);
  const setSelectedCategory = useFinanceStore((s) => s.setSelectedCategory);
  const addTransaction = useFinanceStore((s) => s.addTransaction);

  const monthlySpending = useMemo(() => {
    // Group transactions by month (last 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(m => ({
      month: m,
      amount: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount / 100), 0) // Simplified mock
    }));
  }, [transactions]);

  const categoryBreakdown = useMemo(() => {
    const counts = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + t.amount;
    });
    return Object.entries(counts).map(([label, value]) => ({ label, value }));
  }, [transactions]);

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
    <ModulePageLayout title="Finance" subtitle="Personal finance dashboard with local tracking and planning.">
      <PagePanel 
        title="Balance Overview"
        actions={
          <button
            type="button"
            onClick={() => addTransaction({ amount: 500, category: 'Food', note: 'Quick expense' })}
            className="rounded-lg border border-jarvis-border bg-white/5 px-3 py-1.5 text-xs text-jarvis-text"
          >
            Add Transaction
          </button>
        }
      >
        <FinanceOverviewCards overview={balanceOverview} />
      </PagePanel>

      <div className="grid gap-4 xl:grid-cols-2">
        <PagePanel title="Monthly Spending">
          <MonthlySpendingBars monthlySpending={monthlySpending} />
        </PagePanel>
        <PagePanel title="Category Breakdown">
          <CategoryBreakdown categoryBreakdown={categoryBreakdown} />
        </PagePanel>
      </div>

      <PagePanel title="Savings Tracker">
        <div className="grid gap-3 md:grid-cols-2">
          {savingsGoals.map((goal) => {
            const pct = Math.round((goal.current / goal.target) * 100);
            return (
              <article key={goal.id} className="rounded-xl border border-jarvis-border bg-black/20 p-3">
                <p className="text-sm text-jarvis-text">{goal.title}</p>
                <p className="mt-1 text-xs text-jarvis-muted">
                  {goal.current.toLocaleString('en-IN')} / {goal.target.toLocaleString('en-IN')}
                </p>
                <div className="mt-2">
                  <ProgressBar value={pct} />
                  <p className="mt-1 text-[11px] text-jarvis-muted">{pct}% saved</p>
                </div>
              </article>
            );
          })}
        </div>
      </PagePanel>

      <PagePanel title="Transactions" subtitle="Expenses, income, and category flow.">
        <div className="mb-3 flex flex-wrap gap-2">
          <select
            value={selectedTransactionType}
            onChange={(event) => setSelectedTransactionType(event.target.value)}
            className="rounded-lg border border-jarvis-border bg-black/20 px-2.5 py-1.5 text-xs text-jarvis-text focus:outline-none"
          >
            <option value="all" className="bg-jarvis-panel">All Types</option>
            <option value="expense" className="bg-jarvis-panel">Expense</option>
            <option value="income" className="bg-jarvis-panel">Income</option>
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
    </ModulePageLayout>
  );
}
