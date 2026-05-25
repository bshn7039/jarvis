import { create } from 'zustand';
import { financeService } from '../database/services/financeService';
import { deepClone } from '../utils/deepClone';
import { useActivityStore } from './activityStore';

const initialState = {
  transactions: [],
  balanceOverview: {
    totalBalance: 0,
    monthlySpending: 0,
    monthlyCredits: 0,
    savingsTotal: 0,
    activeAccounts: 0
  },
  accounts: [],
  monthlyHistory: [], // { month: 'May', credited: 0, debited: 0, saved: 0, key: '2026-05' }
  categoryBreakdown: [],
  selectedTransactionType: 'all',
  selectedCategory: 'all',
  isHydrated: false,
};

function calculateDerivedFinance(transactions) {
  const accountsMap = {};
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);

  // Calculate Accounts
  transactions.forEach(t => {
    const accName = t.account || 'cash';
    if (!accountsMap[accName]) {
      accountsMap[accName] = { name: accName, balance: 0, credits: 0, debits: 0 };
    }
    const amount = Number(t.amount) || 0;
    if (t.type === 'credit') {
      accountsMap[accName].balance += amount;
      accountsMap[accName].credits += amount;
    } else {
      accountsMap[accName].balance -= amount;
      accountsMap[accName].debits += amount;
    }
  });

  const accounts = Object.values(accountsMap);

  // Overview
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const savingsAccount = accounts.find(a => a.name.toLowerCase() === 'savings');
  const savingsTotal = savingsAccount ? savingsAccount.balance : 0;

  const monthlyCredits = transactions
    .filter(t => t.type === 'credit' && (t.transactionDate || '').startsWith(currentMonth))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const monthlySpending = transactions
    .filter(t => t.type === 'debit' && (t.transactionDate || '').startsWith(currentMonth))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const balanceOverview = {
    totalBalance,
    monthlySpending,
    monthlyCredits,
    savingsTotal,
    activeAccounts: accounts.length
  };

  // Monthly History Overview
  // Logic: Show months starting from May 2026 (2026-05) only if they have data
  const historyMap = {};
  
  transactions.forEach(t => {
    const monthKey = (t.transactionDate || '').slice(0, 7);
    if (!monthKey || monthKey < '2026-05') return;

    if (!historyMap[monthKey]) {
      const dateObj = new Date(monthKey + '-01');
      historyMap[monthKey] = { 
        month: dateObj.toLocaleString('default', { month: 'short' }), 
        credited: 0, 
        debited: 0, 
        saved: 0, 
        key: monthKey 
      };
    }

    const amount = Number(t.amount) || 0;
    if (t.type === 'credit') {
      historyMap[monthKey].credited += amount;
    } else if (t.type === 'debit') {
      if (t.category === 'Savings Transfer' || (t.tags && t.tags.includes('saving'))) {
        historyMap[monthKey].saved += amount;
      } else {
        historyMap[monthKey].debited += amount;
      }
    }
  });

  const monthlyHistory = Object.values(historyMap).sort((a, b) => a.key.localeCompare(b.key));

  // Category Breakdown
  const categoriesMap = {};
  transactions
    .filter(t => t.type === 'debit' && (t.transactionDate || '').startsWith(currentMonth))
    .forEach(t => {
      const cat = t.category || 'Miscellaneous';
      categoriesMap[cat] = (categoriesMap[cat] || 0) + (Number(t.amount) || 0);
    });

  const categoryBreakdown = Object.entries(categoriesMap).map(([category, amount]) => ({
    category,
    amount
  })).sort((a, b) => b.amount - a.amount);

  return {
    accounts,
    balanceOverview,
    monthlyHistory,
    categoryBreakdown
  };
}

export const useFinanceStore = create((set, get) => ({
  ...deepClone(initialState),

  hydrate: async () => {
    try {
      const transactions = await financeService.getAll();
      const sorted = transactions.sort((a, b) => (b.transactionDate || '').localeCompare(a.transactionDate || ''));
      const derived = calculateDerivedFinance(sorted);
      
      set({ 
        transactions: sorted,
        ...derived,
        isHydrated: true 
      });
    } catch (err) {
      console.error('Failed to hydrate finance:', err);
    }
  },

  setSelectedTransactionType: (value) => set({ selectedTransactionType: value }),
  setSelectedCategory: (value) => set({ selectedCategory: value }),
  
  logActivity: async ({ action, entityId, metadata = {} }) => {
    const activityStore = useActivityStore.getState();
    await activityStore.logActivity({
      type: 'finance',
      action,
      entityType: 'transaction',
      entityId,
      metadata
    });
  },

  addTransaction: async (data) => {
    const transaction = {
      ...data,
      transactionDate: data.transactionDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      archived: false,
      tags: data.tags || [],
      metadata: data.metadata || {},
    };
    
    const saved = await financeService.create(transaction);
    const updatedTransactions = [saved, ...get().transactions].sort((a, b) => (b.transactionDate || '').localeCompare(a.transactionDate || ''));
    const derived = calculateDerivedFinance(updatedTransactions);

    set({
      transactions: updatedTransactions,
      ...derived
    });

    await get().logActivity({ 
      action: 'created', 
      entityId: saved.id,
      metadata: { 
        amount: saved.amount, 
        category: saved.category,
        type: saved.type,
        account: saved.account
      }
    });
    return saved;
  },

  // Special method for savings transfer
  saveMoney: async ({ amount, fromAccount, transactionDate, note }) => {
    const date = transactionDate || new Date().toISOString().split('T')[0];
    const transferId = `transfer-${Date.now()}`;
    
    // 1. Debit from source account
    const debit = {
      type: 'debit',
      amount,
      title: note || `Saving from ${fromAccount}`,
      category: 'Savings Transfer',
      account: fromAccount,
      transactionDate: date,
      tags: ['saving', 'transfer'],
      metadata: { transferId }
    };

    // 2. Credit to savings account
    const credit = {
      type: 'credit',
      amount,
      title: note || `Saving from ${fromAccount}`,
      category: 'Savings Transfer',
      account: 'savings',
      transactionDate: date,
      tags: ['saving', 'transfer'],
      metadata: { transferId }
    };

    const savedDebit = await get().addTransaction(debit);
    const savedCredit = await get().addTransaction(credit);

    return { savedDebit, savedCredit };
  },

  deleteTransaction: async (id) => {
    await financeService.delete(id);
    const updatedTransactions = get().transactions.filter(t => t.id !== id);
    const derived = calculateDerivedFinance(updatedTransactions);
    set({
      transactions: updatedTransactions,
      ...derived
    });
  },

  updateTransaction: async (id, updates) => {
    const transaction = get().transactions.find(t => t.id === id);
    if (!transaction) return;
    const updated = await financeService.update(id, { ...transaction, ...updates });
    const updatedTransactions = get().transactions.map(t => t.id === id ? updated : t)
      .sort((a, b) => (b.transactionDate || '').localeCompare(a.transactionDate || ''));
    const derived = calculateDerivedFinance(updatedTransactions);
    set({
      transactions: updatedTransactions,
      ...derived
    });
  },
}));
