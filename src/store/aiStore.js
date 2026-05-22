import { create } from 'zustand';
import { DEFAULT_MODEL } from '../config/aiModels';

export const useAiStore = create((set) => ({
  isGenerating: false,
  currentModel: DEFAULT_MODEL,
  lastError: null,

  setGenerating: (isGenerating) => set({ isGenerating }),
  setModel: (model) => set({ currentModel: model }),
  setError: (error) => set({ lastError: error }),
  clearError: () => set({ lastError: null }),
}));
