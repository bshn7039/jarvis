import { create } from 'zustand';
import { personalService } from '../database/services/personalService';
import { deepClone } from '../utils/deepClone';
import { useActivityStore } from './activityStore';

const initialState = {
  selfCare: [],
  communication: [],
  socialGrowth: [],
  publicPersona: [],
  music: [],
  writing: [],
  reading: [],
  vault: [],
  isHydrated: false,
};

export const usePersonalStore = create((set, get) => ({
  ...deepClone(initialState),

  hydrate: async () => {
    try {
      const all = await personalService.getAll();
      set({
        selfCare: all.filter(i => i.type === 'selfCare'),
        communication: all.filter(i => i.type === 'communication'),
        socialGrowth: all.filter(i => i.type === 'socialGrowth'),
        publicPersona: all.filter(i => i.type === 'publicPersona'),
        music: all.filter(i => i.type === 'music'),
        writing: all.filter(i => i.type === 'writing'),
        reading: all.filter(i => i.type === 'reading'),
        vault: all.filter(i => i.type === 'vault'),
        isHydrated: true
      });
    } catch (err) {
      console.error('Failed to hydrate personal store:', err);
    }
  },

  logActivity: async ({ action, entityId, type, metadata = {} }) => {
    const activityStore = useActivityStore.getState();
    await activityStore.logActivity({
      type: 'personal',
      action,
      entityType: type,
      entityId,
      metadata
    });
  },

  addItem: async (type, itemData) => {
    const next = {
      ...itemData,
      type,
    };
    const saved = await personalService.create(next);
    set((state) => ({
      [type]: [saved, ...state[type]],
    }));
    await get().logActivity({
      action: 'created',
      entityId: saved.id,
      type,
      metadata: { title: saved.title || saved.name || saved.platform }
    });
    return saved;
  },

  updateItem: async (type, id, updates) => {
    const items = get()[type];
    const item = items.find(i => i.id === id);
    if (!item) return;

    const updated = { ...item, ...updates, updatedAt: new Date().toISOString() };
    await personalService.update(id, updated);
    set((state) => ({
      [type]: state[type].map(i => i.id === id ? updated : i)
    }));
    await get().logActivity({
      action: 'updated',
      entityId: id,
      type,
      metadata: { title: updated.title || updated.name || updated.platform }
    });
  },

  deleteItem: async (type, id) => {
    const item = get()[type].find(i => i.id === id);
    if (!item) return;

    await personalService.delete(id);
    set((state) => ({
      [type]: state[type].filter(i => i.id !== id)
    }));
    await get().logActivity({
      action: 'deleted',
      entityId: id,
      type,
      metadata: { title: item.title || item.name || item.platform }
    });
  },

  toggleStatus: async (type, id) => {
    const items = get()[type];
    const item = items.find(i => i.id === id);
    if (!item) return;

    const updated = { 
      ...item, 
      status: item.status === 'completed' ? 'pending' : 'completed',
      updatedAt: new Date().toISOString() 
    };
    await personalService.update(id, updated);
    set((state) => ({
      [type]: state[type].map(i => i.id === id ? updated : i)
    }));
    await get().logActivity({
      action: updated.status === 'completed' ? 'completed' : 'reopened',
      entityId: id,
      type,
      metadata: { title: item.title || item.name }
    });
  }
}));
