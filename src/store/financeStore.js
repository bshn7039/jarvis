import { create } from 'zustand';
import { financeService } from '../database/services/financeService';
import { savingsGoalService } from '../database/services/savingsGoalService';
import { deepClone } from '../utils/deepClone';

const initialState = {
  balanceOverview: {
    totalBalance: 42500,
    checking: 12400,
    savings: 28500,
    cash: 1600,
  },
  transactions: [],
  savingsGoals: [],
  selectedTransactionType: 'all',
  selectedCategory: 'all',
  isHydrated: false,
};

export const useFinanceStore = create((set, get) => ({
  ...deepClone(initialState),

  hydrate: async () => {
    try {
      const transactions = await financeService.getAll();
      const savingsGoals = await savingsGoalService.getAll();
      
      set({ 
        transactions: transactions.sort((a, b) => b.date.localeCompare(a.date)),
        savingsGoals,
        isHydrated: true 
      });
    } catch (err) {
      console.error('Failed to hydrate finance:', err);
    }
  },

  setSelectedTransactionType: (value) => set({ selectedTransactionType: value }),
  setSelectedCategory: (value) => set({ selectedCategory: value }),
  
  addTransaction: async (transactionData) => {
    const next = {
      date: transactionData.date || '2026-05-21',
      type: transactionData.type || 'expense',
      category: transactionData.category || 'Food',
      amount: Number(transactionData.amount) || 0,
      note: transactionData.note || 'Manual entry',
      linkedTaskId: transactionData.linkedTaskId || null,
    };
    
    const savedTransaction = await financeService.create(next);
    set((state) => ({
      transactions: [savedTransaction, ...state.transactions],
    }));
  },

  updateSavingsProgress: async (goalId, current) => {
    const goals = get().savingsGoals;
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updated = { ...goal, current: Math.max(0, Number(current) || 0) };
    await savingsGoalService.update(goalId, updated);
    set({ savingsGoals: goals.map(g => g.id === goalId ? updated : g) });
  },
}));


