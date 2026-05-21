import { createJSONStorage } from 'zustand/middleware';
import { safeParseJson, STORAGE_KEY } from './safePersist';

const devWarnStorage = (message, value) => {
  if (import.meta.env.DEV) {
    console.warn(`[jarvis] ${message}`, value);
  }
};

function readStorage(name) {
  try {
    const raw = localStorage.getItem(name);
    if (!raw) return null;

    const envelope = safeParseJson(raw, null);
    if (!envelope) {
      devWarnStorage('corrupt persisted envelope, clearing', name);
      localStorage.removeItem(name);
      return null;
    }

    return raw;
  } catch (error) {
    devWarnStorage('storage read failed, clearing', error);
    try {
      localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
    return null;
  }
}

function writeStorage(name, value) {
  try {
    localStorage.setItem(name, value);
  } catch (error) {
    devWarnStorage('storage write failed', error);
  }
}

export function createSafeLocalStorage() {
  return createJSONStorage(() => ({
    getItem: readStorage,
    setItem: writeStorage,
    removeItem: (name) => {
      try {
        localStorage.removeItem(name);
      } catch {
        /* ignore */
      }
    },
  }));
}

export function clearPersistedUi() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
