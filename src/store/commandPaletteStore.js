import { create } from 'zustand';

const initialState = {
  isOpen: false,
  actions: [],
  entities: [],
};

export const useCommandPaletteStore = create((set) => ({
  ...initialState,

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),

  registerActions: (actions) => set({ actions: Array.isArray(actions) ? actions : [] }),
  registerEntities: (entities) => set({ entities: Array.isArray(entities) ? entities : [] }),
  clearRegistry: () => set({ actions: [], entities: [] }),
}));
