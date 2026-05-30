import { create } from 'zustand';
import { financeService } from '../database/services/financeService';
import { deepClone } from '../utils/deepClone';
import { useActivityStore } from './activityStore';
import { localDb, STORES } from '../database/core/localDatabase';

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
      let transactions = await financeService.getAll();

      // Auto-seed default Yes Bank transactions if any of them are missing to populate user ledger instantly
      const defaultTxns = [
        { id: 't-seed-1', transactionDate: '2026-04-23', title: 'Rapido', category: 'Transport', type: 'debit', amount: 150, account: 'checking' },
        { id: 't-seed-2', transactionDate: '2026-05-01', title: 'Opening Balance (Yes Bank)', category: 'Starting Balance', type: 'credit', amount: 3000, account: 'checking' },
        { id: 't-seed-3', transactionDate: '2026-05-01', title: 'Rapido', category: 'Transport', type: 'debit', amount: 70, account: 'checking' },
        { id: 't-seed-4', transactionDate: '2026-05-03', title: 'WiFi Recharge', category: 'Bills & Utilities', type: 'debit', amount: 650, account: 'checking' },
        { id: 't-seed-5', transactionDate: '2026-05-05', title: 'Water Bottle / Misc', category: 'Miscellaneous', type: 'debit', amount: 100, account: 'checking' },
        { id: 't-seed-6', transactionDate: '2026-05-06', title: 'Online Expense', category: 'Miscellaneous', type: 'debit', amount: 200, account: 'checking' },
        { id: 't-seed-7', transactionDate: '2026-05-08', title: 'Cafe', category: 'Food & Dining', type: 'debit', amount: 100, account: 'checking' },
        { id: 't-seed-8', transactionDate: '2026-05-08', title: '1 Mall', category: 'Shopping', type: 'debit', amount: 200, account: 'checking' },
        { id: 't-seed-9', transactionDate: '2026-05-09', title: 'Spotify', category: 'Subscriptions', type: 'debit', amount: 100, account: 'checking' },
        { id: 't-seed-10', transactionDate: '2026-05-10', title: 'Mummy Rapido', category: 'Transport', type: 'debit', amount: 150, account: 'checking' },
        { id: 't-seed-11', transactionDate: '2026-05-10', title: 'Bhajni', category: 'Food & Dining', type: 'debit', amount: 80, account: 'checking' },
        { id: 't-seed-12', transactionDate: '2026-05-10', title: 'Mame / Mama', category: 'Miscellaneous', type: 'debit', amount: 100, account: 'checking' },
        { id: 't-seed-13', transactionDate: '2026-05-11', title: 'Account Inflow / Deposit', category: 'Salary / Income', type: 'credit', amount: 53900, account: 'checking' },
        { id: 't-seed-14', transactionDate: '2026-05-11', title: 'Given to Mummy', category: 'Miscellaneous', type: 'debit', amount: 20000, account: 'checking' },
        { id: 't-seed-15', transactionDate: '2026-05-12', title: 'Mama Cash', category: 'Miscellaneous', type: 'debit', amount: 30200, account: 'checking' },
        { id: 't-seed-16', transactionDate: '2026-05-13', title: 'Rapido (Nilje)', category: 'Transport', type: 'debit', amount: 500, account: 'checking' },
        { id: 't-seed-17', transactionDate: '2026-05-13', title: 'Water & Thums Up', category: 'Food & Dining', type: 'debit', amount: 60, account: 'checking' },
        { id: 't-seed-18', transactionDate: '2026-05-13', title: 'Shraddha Mhatre', category: 'Miscellaneous', type: 'debit', amount: 250, account: 'checking' },
        { id: 't-seed-19', transactionDate: '2026-05-14', title: "McDonald's (Macd)", category: 'Food & Dining', type: 'debit', amount: 300, account: 'checking' },
        { id: 't-seed-20', transactionDate: '2026-05-15', title: 'Seawoods Bowling', category: 'Entertainment', type: 'debit', amount: 500, account: 'checking' },
        { id: 't-seed-21', transactionDate: '2026-05-16', title: 'CSMU Registration', category: 'Education', type: 'debit', amount: 1500, account: 'checking' },
        { id: 't-seed-22', transactionDate: '2026-05-16', title: 'CSMU Additional Fee', category: 'Education', type: 'debit', amount: 400, account: 'checking' },
        { id: 't-seed-23', transactionDate: '2026-05-16', title: 'Mobile Recharge', category: 'Bills & Utilities', type: 'debit', amount: 400, account: 'checking' },
        { id: 't-seed-24', transactionDate: '2026-05-17', title: 'Kharghar (Khagar) Expense', category: 'Transport', type: 'debit', amount: 500, account: 'checking' },
        { id: 't-seed-25', transactionDate: '2026-05-17', title: 'Rapido', category: 'Transport', type: 'debit', amount: 150, account: 'checking' },
        { id: 't-seed-26', transactionDate: '2026-05-17', title: 'Pillai College Expense', category: 'Education', type: 'debit', amount: 50, account: 'checking' },
        { id: 't-seed-27', transactionDate: '2026-05-17', title: 'Soap', category: 'Shopping', type: 'debit', amount: 50, account: 'checking' },
        { id: 't-seed-28', transactionDate: '2026-05-17', title: 'Boot (Shoes)', category: 'Shopping', type: 'debit', amount: 250, account: 'checking' },
        { id: 't-seed-29', transactionDate: '2026-05-24', title: 'Monthly Allowance / Salary', category: 'Salary / Income', type: 'credit', amount: 5000, account: 'checking' },
        { id: 't-seed-30', transactionDate: '2026-05-25', title: 'Mobile Stand', category: 'Shopping', type: 'debit', amount: 100, account: 'checking' },
        { id: 't-seed-31', transactionDate: '2026-05-25', title: 'Keyboard & Mouse Mat', category: 'Shopping', type: 'debit', amount: 100, account: 'checking' },
        { id: 't-seed-32', transactionDate: '2026-05-26', title: 'Heads (Headphones)', category: 'Shopping', type: 'debit', amount: 400, account: 'checking' },
        { id: 't-seed-33', transactionDate: '2026-05-26', title: 'Food', category: 'Food & Dining', type: 'debit', amount: 200, account: 'checking' },
        { id: 't-seed-34', transactionDate: '2026-05-27', title: 'Books x2', category: 'Education', type: 'debit', amount: 380, account: 'checking' },
        { id: 't-seed-35', transactionDate: '2026-05-27', title: 'Gemini AI x2', category: 'Subscriptions', type: 'debit', amount: 200, account: 'checking' }
      ];

      const seedFlag = await localDb.getById(STORES.METADATA, 'yes-bank-seeded') || { id: 'yes-bank-seeded', seeded: false };
      if (!seedFlag.seeded) {
        const existingIds = new Set(transactions.map(t => t.id));
        const missingTxns = defaultTxns.filter(t => !existingIds.has(t.id));
        if (missingTxns.length > 0) {
          await Promise.all(missingTxns.map(t => financeService.create(t)));
          transactions = await financeService.getAll();
        }
        await localDb.put(STORES.METADATA, { id: 'yes-bank-seeded', seeded: true });
      }

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

  deleteTransactions: async (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) return;
    await Promise.all(ids.map(id => financeService.delete(id)));
    const updatedTransactions = get().transactions.filter(t => !ids.includes(t.id));
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
