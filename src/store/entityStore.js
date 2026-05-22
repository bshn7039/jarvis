import { create } from 'zustand';

const initialState = {
  entities: [],
  isHydrated: false,
};

export const useEntityStore = create((set, get) => ({
  ...initialState,

  hydrate: async () => {
    try {
      // Implement hydration logic for all entities
    } catch (err) {
      console.error('Failed to hydrate entities:', err);
    }
  },

  addEntity: (entity) => set((state) => ({ entities: [...state.entities, entity] })),
  updateEntity: (id, updatedEntity) =>
    set((state) => ({
      entities: state.entities.map((e) => (e.id === id ? { ...e, ...updatedEntity } : e)),
    })),
  deleteEntity: (id) =>
    set((state) => ({ entities: state.entities.filter((e) => e.id !== id) })),
}));
