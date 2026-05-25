import { create } from 'zustand';
import { trashService } from '../database/services/trashService';

export const useTrashStore = create((set, get) => ({
  trashItems: [],
  isHydrated: false,

  hydrate: async () => {
    const items = await trashService.getAll();
    set({ trashItems: items, isHydrated: true });
  },

  restoreItem: async (trashId) => {
    await trashService.restore(trashId);
    await get().hydrate();
  },

  permanentDelete: async (trashId) => {
    await trashService.permanentDelete(trashId);
    await get().hydrate();
  },

  clearTrash: async () => {
    await trashService.clearTrash();
    await get().hydrate();
  }
}));
