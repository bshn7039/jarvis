import { mockDatabase } from '../data/mockDatabase';
import { createPersistedStore } from './persistHelpers';

const initialState = {
  balanceOverview: mockDatabase.finance.balanceOverview,
  monthlySpending: mockDatabase.finance.monthlySpending,
  categoryBreakdown: mockDatabase.finance.categoryBreakdown,
  transactions: mockDatabase.finance.transactions,
  savingsGoals: mockDatabase.finance.savingsGoals,
  incomeStreams: mockDatabase.finance.incomeStreams,
  selectedTransactionType: 'all',
  selectedCategory: 'all',
};

export const useFinanceStore = createPersistedStore({
  name: 'jarvis-finance',
  initialState,
  partialize: (state) => ({
    balanceOverview: state.balanceOverview,
    monthlySpending: state.monthlySpending,
    categoryBreakdown: state.categoryBreakdown,
    transactions: state.transactions,
    savingsGoals: state.savingsGoals,
    incomeStreams: state.incomeStreams,
    selectedTransactionType: state.selectedTransactionType,
    selectedCategory: state.selectedCategory,
  }),
  actions: (set) => ({
    setSelectedTransactionType: (value) => set({ selectedTransactionType: value }),
    setSelectedCategory: (value) => set({ selectedCategory: value }),
    addTransaction: (transaction) =>
      set((state) => ({
        transactions: [
          {
            id: `txn-local-${Date.now()}`,
            date: transaction.date || '2026-05-21',
            type: transaction.type || 'expense',
            category: transaction.category || 'Food',
            amount: Number(transaction.amount) || 0,
            note: transaction.note || 'Manual entry',
            linkedTaskId: transaction.linkedTaskId || null,
          },
          ...state.transactions,
        ],
      })),
    updateSavingsProgress: (goalId, current) =>
      set((state) => ({
        savingsGoals: state.savingsGoals.map((goal) =>
          goal.id === goalId
            ? { ...goal, current: Math.max(0, Number(current) || 0) }
            : goal,
        ),
      })),
  }),
});
