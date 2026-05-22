import { create } from 'zustand';

const initialState = {
  isOpen: false,
};

export const useCommandPaletteStore = create((set, get) => ({
  ...initialState,

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
}));
