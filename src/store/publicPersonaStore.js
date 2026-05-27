import { create } from 'zustand';
import { publicPersonaService } from '../database/services/publicPersonaService';
import { useActivityStore } from './activityStore';
import { trashService } from '../database/services/trashService';

export const usePublicPersonaStore = create((set, get) => ({
  platforms: [],
  isHydrated: false,

  hydrate: async () => {
    try {
      const platforms = await publicPersonaService.getAll();
      set({ platforms, isHydrated: true });
    } catch (err) {
      console.error('Failed to hydrate public persona store:', err);
    }
  },

  addItem: async (data) => {
    const next = {
      ...data,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    const saved = await publicPersonaService.create(next);
    set(state => ({ platforms: [saved, ...state.platforms] }));
    await useActivityStore.getState().logActivity({
      type: 'personal',
      action: 'created',
      entityType: 'publicPersona',
      entityId: saved.id,
      metadata: { platform: saved.platform, username: saved.username }
    });
    return saved;
  },

  updateItem: async (id, updates) => {
    const platform = get().platforms.find(p => p.id === id);
    if (!platform) return;
    const next = { ...platform, ...updates, lastUpdated: new Date().toISOString() };
    await publicPersonaService.update(id, next);
    set(state => ({ platforms: state.platforms.map(p => p.id === id ? next : p) }));
  },

  deleteItem: async (id) => {
    const platform = get().platforms.find(p => p.id === id);
    if (platform) {
      await trashService.moveToTrash('personalPublicPersona', platform);
    }
    await publicPersonaService.delete(id);
    set(state => ({ platforms: state.platforms.filter(p => p.id !== id) }));
  }
}));
