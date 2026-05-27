import { localDb, STORES } from '../database/core/localDatabase';

const LINKED_KEYS = new Set([
  'linkedGoalIds',
  'linkedTaskIds',
  'linkedScheduleIds',
  'linkedJournalIds',
  'linkedEntityIds',
  'linkedAcademicIds',
  'linkedSubjectIds',
]);

function cleanupObjectReferences(input, removedId) {
  if (Array.isArray(input)) {
    let changed = false;
    const mapped = input.map((entry) => {
      const cleaned = cleanupObjectReferences(entry, removedId);
      if (cleaned !== entry) changed = true;
      return cleaned;
    });
    return changed ? mapped : input;
  }

  if (!input || typeof input !== 'object') return input;

  let changed = false;
  const out = { ...input };
  for (const [key, value] of Object.entries(input)) {
    if (Array.isArray(value) && LINKED_KEYS.has(key)) {
      const filtered = value.filter((id) => id !== removedId);
      if (filtered.length !== value.length) {
        out[key] = filtered;
        changed = true;
      }
      continue;
    }
    if (typeof value === 'string' && key.toLowerCase() !== 'id' && key.toLowerCase().endsWith('id') && value === removedId) {
      out[key] = null;
      changed = true;
      continue;
    }
    if (value && typeof value === 'object') {
      const cleaned = cleanupObjectReferences(value, removedId);
      if (cleaned !== value) {
        out[key] = cleaned;
        changed = true;
      }
    }
  }
  return changed ? out : input;
}

const SYSTEM_STORES = new Set([
  STORES.TRASH,
  STORES.VERSIONS,
  STORES.ACTIVITIES,
  STORES.CHATS,
  STORES.METRICS_SNAPSHOTS,
  STORES.METADATA,
]);

export async function cleanupEntityReferences(removedId) {
  if (!removedId) return;
  
  // Exclude system, log, and history stores
  const stores = Object.values(STORES).filter(
    (storeName) => !SYSTEM_STORES.has(storeName)
  );

  for (const storeName of stores) {
    const rows = await localDb.getAll(storeName);
    for (const row of rows) {
      const next = cleanupObjectReferences(row, removedId);
      if (next !== row) {
        await localDb.put(storeName, next);
      }
    }
  }
}
