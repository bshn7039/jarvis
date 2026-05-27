import { useFinanceStore } from '../../../store/financeStore';
import { useMutualFundStore } from '../../../store/mutualFundStore';

export function getFinanceContext() {
  const state = useFinanceStore.getState();
  const mfState = useMutualFundStore.getState();

  const accountsSummary = (state.accounts || []).map(a => ({
    name: a.name,
    balance: a.balance
  }));

  const recentTransactions = (state.transactions || [])
    .slice(0, 50)
    .map(t => ({
      id: t.id,
      date: t.transactionDate,
      title: t.title,
      amount: t.amount,
      type: t.type,
      category: t.category,
      account: t.account
    }));

  const mfTotals = mfState.getPortfolioTotals();
  const mutualFundsSummary = (mfState.funds || []).map(f => {
    const stats = mfState.computeFundStats(f);
    return {
      id: f.id,
      schemeName: f.schemeName,
      schemeCode: f.schemeCode,
      totalInvested: stats.totalInvested,
      currentValue: stats.currentValue,
      returns: stats.returns,
      returnsPercent: stats.returnsPercent,
      xirr: stats.xirr,
      purchasesCount: f.purchases?.length || 0,
      purchases: (f.purchases || []).map(p => ({
        id: p.id,
        date: p.date,
        amount: p.amount,
        nav: p.nav,
        units: p.units
      }))
    };
  });

  return {
    balanceOverview: state.balanceOverview || {},
    accounts: accountsSummary,
    topCategories: (state.categoryBreakdown || []).slice(0, 5),
    recentTransactions,
    mutualFunds: {
      totals: {
        totalInvested: mfTotals.totalInvested,
        totalCurrentValue: mfTotals.totalCurrentValue,
        totalReturns: mfTotals.totalReturns,
        totalReturnsPercent: mfTotals.totalReturnsPercent,
      },
      funds: mutualFundsSummary
    }
  };
}
