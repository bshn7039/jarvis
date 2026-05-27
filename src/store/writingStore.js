import { create } from 'zustand';
import { writingService } from '../database/services/writingService';
import { useActivityStore } from './activityStore';
import { trashService } from '../database/services/trashService';

export const useWritingStore = create((set, get) => ({
  drafts: [],
  isHydrated: false,

  hydrate: async () => {
    try {
      const drafts = await writingService.getAll();
      set({ drafts, isHydrated: true });
    } catch (err) {
      console.error('Failed to hydrate writing store:', err);
    }
  },

  addItem: async (data) => {
    const next = {
      ...data,
      createdAt: new Date().toISOString(),
    };
    const saved = await writingService.create(next);
    set(state => ({ drafts: [saved, ...state.drafts] }));
    await useActivityStore.getState().logActivity({
      type: 'personal',
      action: 'created',
      entityType: 'writing',
      entityId: saved.id,
      metadata: { title: saved.title, type: saved.type }
    });
    return saved;
  },

  updateItem: async (id, updates) => {
    const draft = get().drafts.find(d => d.id === id);
    if (!draft) return;
    const next = { ...draft, ...updates };
    await writingService.update(id, next);
    set(state => ({ drafts: state.drafts.map(d => d.id === id ? next : d) }));
  },

  deleteItem: async (id) => {
    const draft = get().drafts.find(d => d.id === id);
    if (draft) {
      await trashService.moveToTrash('personalWriting', draft);
    }
    await writingService.delete(id);
    set(state => ({ drafts: state.drafts.filter(d => d.id !== id) }));
  }
}));
