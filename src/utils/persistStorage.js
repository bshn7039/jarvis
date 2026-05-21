import { createJSONStorage } from 'zustand/middleware';
import { safeParseJson, STORAGE_KEY } from './safePersist';
import { resetCorruptState } from './storage';

const PERSISTENCE_ENABLED = true;
const WRITE_THROTTLE_MS = 120;
const writeTimers = new Map();

const devWarnStorage = (message, value) => {
  if (import.meta.env.DEV) {
    console.warn(`[jarvis] ${message}`, value);
  }
};

function readStorage(name) {
  if (!PERSISTENCE_ENABLED) {
    return null;
  }

  try {
    const raw = localStorage.getItem(name);
    if (!raw) return null;

    const envelope = safeParseJson(raw, null);
    if (!envelope) {
      devWarnStorage('corrupt persisted envelope, clearing', name);
      resetCorruptState(name);
      return null;
    }

    return raw;
  } catch (error) {
    devWarnStorage('storage read failed, clearing', error);
    resetCorruptState(name);
    return null;
  }
}

function writeStorage(name, value) {
  if (!PERSISTENCE_ENABLED) {
    return;
  }

  if (writeTimers.has(name)) {
    clearTimeout(writeTimers.get(name));
  }

  const timer = setTimeout(() => {
    writeTimers.delete(name);
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      devWarnStorage('storage write failed', error);
    }
  }, WRITE_THROTTLE_MS);

  writeTimers.set(name, timer);
}

export function createSafeLocalStorage() {
  if (!PERSISTENCE_ENABLED) {
    clearPersistedUi();
  }

  return createJSONStorage(() => ({
    getItem: readStorage,
    setItem: writeStorage,
    removeItem: (name) => {
      const timer = writeTimers.get(name);
      if (timer) {
        clearTimeout(timer);
        writeTimers.delete(name);
      }
      try {
        localStorage.removeItem(name);
      } catch {
        /* ignore */
      }
    },
  }));
}

export function clearPersistedUi() {
  const timer = writeTimers.get(STORAGE_KEY);
  if (timer) {
    clearTimeout(timer);
    writeTimers.delete(STORAGE_KEY);
  }
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
