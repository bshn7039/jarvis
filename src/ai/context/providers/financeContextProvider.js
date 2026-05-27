import { useFinanceStore } from '../../../store/financeStore';

export function getFinanceContext() {
  const state = useFinanceStore.getState();

  const accountsSummary = (state.accounts || []).map(a => ({
    name: a.name,
    balance: a.balance
  }));

  const recentTransactions = (state.transactions || [])
    .slice(0, 10)
    .map(t => ({
      id: t.id,
      date: t.transactionDate,
      title: t.title,
      amount: t.amount,
      type: t.type,
      category: t.category,
      account: t.account
    }));

  return {
    balanceOverview: state.balanceOverview || {},
    accounts: accountsSummary,
    topCategories: (state.categoryBreakdown || []).slice(0, 5),
    recentTransactions
  };
}
