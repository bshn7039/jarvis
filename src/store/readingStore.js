import { create } from 'zustand';
import { readingService } from '../database/services/readingService';
import { useActivityStore } from './activityStore';
import { trashService } from '../database/services/trashService';

export const useReadingStore = create((set, get) => ({
  library: [],
  isHydrated: false,

  hydrate: async () => {
    try {
      const library = await readingService.getAll();
      set({ library, isHydrated: true });
    } catch (err) {
      console.error('Failed to hydrate reading store:', err);
    }
  },

  addItem: async (data) => {
    const next = {
      ...data,
      createdAt: new Date().toISOString(),
    };
    const saved = await readingService.create(next);
    set(state => ({ library: [saved, ...state.library] }));
    await useActivityStore.getState().logActivity({
      type: 'personal',
      action: 'created',
      entityType: 'reading',
      entityId: saved.id,
      metadata: { title: saved.title, author: saved.author }
    });
    return saved;
  },

  updateItem: async (id, updates) => {
    const book = get().library.find(b => b.id === id);
    if (!book) return;
    const next = { ...book, ...updates };
    await readingService.update(id, next);
    set(state => ({ library: state.library.map(b => b.id === id ? next : b) }));
  },

  deleteItem: async (id) => {
    const book = get().library.find(b => b.id === id);
    if (book) {
      await trashService.moveToTrash('personalReading', book);
    }
    await readingService.delete(id);
    set(state => ({ library: state.library.filter(b => b.id !== id) }));
  }
}));
