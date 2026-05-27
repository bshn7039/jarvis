import { create } from 'zustand';
import { communicationService } from '../database/services/communicationService';
import { useActivityStore } from './activityStore';
import { trashService } from '../database/services/trashService';

export const useCommunicationStore = create((set, get) => ({
  logs: [],
  isHydrated: false,

  hydrate: async () => {
    try {
      const logs = await communicationService.getAll();
      set({ logs, isHydrated: true });
    } catch (err) {
      console.error('Failed to hydrate communication store:', err);
    }
  },

  addItem: async (data) => {
    const next = {
      ...data,
      createdAt: new Date().toISOString(),
    };
    const saved = await communicationService.create(next);
    set(state => ({ logs: [saved, ...state.logs] }));
    await useActivityStore.getState().logActivity({
      type: 'personal',
      action: 'created',
      entityType: 'communication',
      entityId: saved.id,
      metadata: { title: saved.title, type: saved.type }
    });
    return saved;
  },

  updateItem: async (id, updates) => {
    const log = get().logs.find(l => l.id === id);
    if (!log) return;
    const next = { ...log, ...updates };
    await communicationService.update(id, next);
    set(state => ({ logs: state.logs.map(l => l.id === id ? next : l) }));
  },

  deleteItem: async (id) => {
    const log = get().logs.find(l => l.id === id);
    if (log) {
      await trashService.moveToTrash('personalCommunication', log);
    }
    await communicationService.delete(id);
    set(state => ({ logs: state.logs.filter(l => l.id !== id) }));
  },

  getWeeklyStats: () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentLogs = get().logs.filter(l => new Date(l.createdAt) > weekAgo);
    
    const totalDuration = recentLogs.reduce((acc, l) => {
      const mins = parseInt(l.duration) || 0;
      return acc + mins;
    }, 0);

    return {
      count: recentLogs.length,
      totalDuration,
      averageRating: recentLogs.length ? (recentLogs.reduce((acc, l) => acc + (Number(l.rating) || 0), 0) / recentLogs.length).toFixed(1) : 0
    };
  }
}));
