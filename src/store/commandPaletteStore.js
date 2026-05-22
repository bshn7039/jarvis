import create from 'zustand';

export const useCommandPaletteStore = create((set) => ({
  open: false,
  actions: [],
  entities: [],
  openPalette: () => set({ open: true }),
  open: false,
  close: () => set({ open: false }),
  registerAction: (action) => set(state => ({ actions: [...state.actions, action] })),
  setEntities: (ents) => set({ entities: ents }),
}));

// helper export with consistent names
export const { openPalette, close, registerAction, setEntities } = useCommandPaletteStore.getState();
