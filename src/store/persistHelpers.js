import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { deepClone } from '../utils/deepClone';

const safeStorage = createJSONStorage(() => ({
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      /* ignore */
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
}));

export function createPersistedStore({
  name,
  initialState,
  actions,
  partialize = (state) => state,
  version = 1,
}) {
  return create(
    persist(
      (set, get) => ({
        ...deepClone(initialState),
        ...actions(set, get),
      }),
      {
        name,
        version,
        storage: safeStorage,
        partialize,
        merge: (persisted, current) => ({
          ...current,
          ...(persisted?.state ?? persisted),
        }),
      },
    ),
  );
}
