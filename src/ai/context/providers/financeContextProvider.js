import { useFinanceStore } from '../../../store/financeStore';
import { useMutualFundStore } from '../../../store/mutualFundStore';
import { parseDatesFromPrompt } from './dateContextHelper';

export function getFinanceContext(prompt) {
  const state = useFinanceStore.getState();
  const mfState = useMutualFundStore.getState();

  const accountsSummary = (state.accounts || []).map(a => ({
    name: a.name,
    balance: a.balance
  }));

  // Dynamic date matching
  const targetDates = parseDatesFromPrompt(prompt);
  let matchedTransactions = [];

  if (targetDates.length > 0) {
    matchedTransactions = (state.transactions || [])
      .filter(t => targetDates.includes(t.transactionDate))
      .map(t => ({
        id: t.id,
        date: t.transactionDate,
        title: t.title,
        amount: t.amount,
        type: t.type,
        category: t.category,
        account: t.account
      }));
  }

  // Optimize token count: Show only the 10 most recent transactions (down from 50) for general context
  const recentTransactions = (state.transactions || [])
    .filter(t => !matchedTransactions.some(mt => mt.id === t.id)) // Avoid duplicates
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

  const mfTotals = mfState.getPortfolioTotals();
  const p = prompt ? prompt.toLowerCase() : '';
  const needsPurchaseHistory = p.includes('purchase') || p.includes('sip') || p.includes('history') || p.includes('transaction') || p.includes('buy');

  const mutualFundsSummary = (mfState.funds || []).map(f => {
    const stats = mfState.computeFundStats(f);
    // Context limit: only load purchase details if requested. Slices to 1 by default, or 5 if specifically asking for history.
    const sliceCount = needsPurchaseHistory ? 5 : 1;
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
      purchases: (f.purchases || []).slice(-sliceCount).map(p => ({
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
    matchedDateTransactions: matchedTransactions.length > 0 ? matchedTransactions : undefined,
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
