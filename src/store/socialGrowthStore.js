import { create } from 'zustand';
import { socialGrowthService } from '../database/services/socialGrowthService';
import { useActivityStore } from './activityStore';
import { trashService } from '../database/services/trashService';

export const useSocialGrowthStore = create((set, get) => ({
  records: [],
  isHydrated: false,

  hydrate: async () => {
    try {
      const records = await socialGrowthService.getAll();
      set({ records, isHydrated: true });
    } catch (err) {
      console.error('Failed to hydrate social growth store:', err);
    }
  },

  addItem: async (data) => {
    const next = {
      ...data,
      createdAt: new Date().toISOString(),
    };
    const saved = await socialGrowthService.create(next);
    set(state => ({ records: [saved, ...state.records] }));
    await useActivityStore.getState().logActivity({
      type: 'personal',
      action: 'created',
      entityType: 'socialGrowth',
      entityId: saved.id,
      metadata: { title: saved.title, linkedContactId: saved.linkedContactId }
    });
    return saved;
  },

  updateItem: async (id, updates) => {
    const record = get().records.find(r => r.id === id);
    if (!record) return;
    const next = { ...record, ...updates };
    await socialGrowthService.update(id, next);
    set(state => ({ records: state.records.map(r => r.id === id ? next : r) }));
  },

  deleteItem: async (id) => {
    const record = get().records.find(r => r.id === id);
    if (record) {
      await trashService.moveToTrash('personalSocialGrowth', record);
    }
    await socialGrowthService.delete(id);
    set(state => ({ records: state.records.filter(r => r.id !== id) }));
  },

  getConfidenceTrend: () => {
    return get().records
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map(r => ({ date: r.createdAt.split('T')[0], confidence: r.confidenceLevel }));
  }
}));
