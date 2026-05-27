import { create } from 'zustand';
import { musicService } from '../database/services/musicService';
import { useActivityStore } from './activityStore';
import { trashService } from '../database/services/trashService';

export const useMusicStore = create((set, get) => ({
  practiceLogs: [],
  isHydrated: false,

  hydrate: async () => {
    try {
      const practiceLogs = await musicService.getAll();
      set({ practiceLogs, isHydrated: true });
    } catch (err) {
      console.error('Failed to hydrate music store:', err);
    }
  },

  addItem: async (data) => {
    const next = {
      ...data,
      createdAt: new Date().toISOString(),
    };
    const saved = await musicService.create(next);
    set(state => ({ practiceLogs: [saved, ...state.practiceLogs] }));
    await useActivityStore.getState().logActivity({
      type: 'personal',
      action: 'created',
      entityType: 'music',
      entityId: saved.id,
      metadata: { title: saved.title, category: saved.category }
    });
    return saved;
  },

  updateItem: async (id, updates) => {
    const log = get().practiceLogs.find(l => l.id === id);
    if (!log) return;
    const next = { ...log, ...updates };
    await musicService.update(id, next);
    set(state => ({ practiceLogs: state.practiceLogs.map(l => l.id === id ? next : l) }));
  },

  deleteItem: async (id) => {
    const log = get().practiceLogs.find(l => l.id === id);
    if (log) {
      await trashService.moveToTrash('personalMusic', log);
    }
    await musicService.delete(id);
    set(state => ({ practiceLogs: state.practiceLogs.filter(l => l.id !== id) }));
  }
}));
