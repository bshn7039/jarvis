import create from 'zustand';

// Basic entity store with IndexedDB persistence per-type. Designed to be additive and not to replace core persistence.

function openEntityDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('jarvis-entities-v1', 1);
    req.onupgradeneeded = (ev) => {
      const db = ev.target.result;
      if (!db.objectStoreNames.contains('entities')) db.createObjectStore('entities', { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function persistEntity(entity) {
  const db = await openEntityDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('entities', 'readwrite');
    tx.objectStore('entities').put(entity);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

async function deleteEntityFromDB(id) {
  const db = await openEntityDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('entities', 'readwrite');
    tx.objectStore('entities').delete(id);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export const useEntityStore = create((set, get) => ({
  entities: {},
  loadAll: async () => {
    const db = await openEntityDB();
    return new Promise((resolve) => {
      const tx = db.transaction('entities', 'readonly');
      const cur = tx.objectStore('entities').openCursor();
      const all = {};
      cur.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          all[cursor.key] = cursor.value;
          cursor.continue();
        }
      };
      tx.oncomplete = () => { set({ entities: all }); resolve(all); };
    });
  },
  create: async (entity) => {
    const now = new Date().toISOString();
    const e = { ...entity, id: entity.id || `e_${Date.now()}`, createdAt: entity.createdAt || now, updatedAt: now };
    await persistEntity(e);
    set(state => ({ entities: { ...state.entities, [e.id]: e } }));
    // activity logging should be done via activity store directly by caller
    return e;
  },
  update: async (id, patch) => {
    const state = get().entities[id];
    if (!state) throw new Error('Not found');
    const next = { ...state, ...patch, updatedAt: new Date().toISOString() };
    await persistEntity(next);
    set(s => ({ entities: { ...s.entities, [id]: next } }));
    return next;
  },
  delete: async (id) => {
    await deleteEntityFromDB(id);
    set(s => { const n = { ...s.entities }; delete n[id]; return { entities: n }; });
    return true;
  },
  duplicate: async (id) => {
    const src = get().entities[id];
    if (!src) throw new Error('Not found');
    const copy = { ...src, id: `e_${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), title: (src.title ? src.title + ' (copy)' : undefined) };
    await persistEntity(copy);
    set(s => ({ entities: { ...s.entities, [copy.id]: copy } }));
    return copy;
  },
  archive: async (id) => {
    return get().update(id, { archived: true });
  },
  restore: async (id) => {
    return get().update(id, { archived: false });
  },
  queryByType: (type) => Object.values(get().entities).filter(e => e.type === type),
}));
