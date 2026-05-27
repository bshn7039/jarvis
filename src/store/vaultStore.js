import { create } from 'zustand';
import { vaultService } from '../database/services/vaultService';
import { useActivityStore } from './activityStore';
import { trashService } from '../database/services/trashService';

export const useVaultStore = create((set, get) => ({
  ideas: [],
  isHydrated: false,

  hydrate: async () => {
    try {
      const ideas = await vaultService.getAll();
      set({ ideas, isHydrated: true });
    } catch (err) {
      console.error('Failed to hydrate vault store:', err);
    }
  },

  addItem: async (data) => {
    const next = {
      ...data,
      createdAt: new Date().toISOString(),
    };
    const saved = await vaultService.create(next);
    set(state => ({ ideas: [saved, ...state.ideas] }));
    await useActivityStore.getState().logActivity({
      type: 'personal',
      action: 'created',
      entityType: 'vault',
      entityId: saved.id,
      metadata: { title: saved.title }
    });
    return saved;
  },

  updateItem: async (id, updates) => {
    const idea = get().ideas.find(i => i.id === id);
    if (!idea) return;
    const next = { ...idea, ...updates };
    await vaultService.update(id, next);
    set(state => ({ ideas: state.ideas.map(i => i.id === id ? next : i) }));
  },

  deleteItem: async (id) => {
    const idea = get().ideas.find(i => i.id === id);
    if (idea) {
      await trashService.moveToTrash('personalVault', idea);
    }
    await vaultService.delete(id);
    set(state => ({ ideas: state.ideas.filter(i => i.id !== id) }));
  }
}));
