import { localDb, STORES } from '../database/core/localDatabase';
import { schemas } from '../database/schemas';
import { useActivityStore } from '../store/activityStore';
import { useTaskStore } from '../store/taskStore';
import { useGoalStore } from '../store/goalStore';
import { useJournalStore } from '../store/journalStore';
import { useFinanceStore } from '../store/financeStore';
import { useFitnessStore } from '../store/fitnessStore';
import { useCrmStore } from '../store/crmStore';
import { useAcademicStore } from '../store/academicStore';
import { useScheduleStore } from '../store/scheduleStore';
import { useChatStore } from '../store/chatStore';
import { useProfileStore } from '../store/profileStore';

const MODULE_BINDINGS = {
  tasks: { store: STORES.TASKS, schemaKey: 'tasks', entityType: 'task', collection: true },
  goals: { store: STORES.GOALS, schemaKey: 'goals', entityType: 'goal', collection: true },
  'journal.entries': { store: STORES.JOURNAL_ENTRIES, schemaKey: 'journalEntries', entityType: 'journal_entry', collection: true },
  'finance.transactions': { store: STORES.FINANCE_TRANSACTIONS, schemaKey: 'financeTransactions', entityType: 'transaction', collection: true },
  'fitness.workouts': { store: STORES.FITNESS_LOGS, schemaKey: 'fitnessLogs', entityType: 'fitness_log', collection: true },
  'fitness.meals': { store: STORES.FITNESS_LOGS, schemaKey: 'fitnessLogs', entityType: 'fitness_log', collection: true },
  'fitness.hydrationLogs': { store: STORES.FITNESS_LOGS, schemaKey: 'fitnessLogs', entityType: 'fitness_log', collection: true },
  'crm.contacts': { store: STORES.CRM_CONTACTS, schemaKey: 'crmContacts', entityType: 'contact', collection: true },
  'academics.subjects': { store: STORES.ACADEMIC_SUBJECTS, schemaKey: 'academicSubjects', entityType: 'academic_subject', collection: true },
  schedules: { store: STORES.SCHEDULES, schemaKey: 'schedules', entityType: 'schedule', collection: true },
  chats: { store: STORES.CHATS, schemaKey: 'chats', entityType: 'chat', collection: true },
  profile: { store: STORES.PROFILE, schemaKey: 'profile', entityType: 'profile', collection: false, fixedId: 'root-profile' },
};

function parsePath(path) {
  return String(path || '').split('.').filter(Boolean);
}

function resolvePath(data, path) {
  const segments = parsePath(path);
  if (!segments.length) return null;

  let current = data;
  let parent = null;
  let parentKey = null;
  const chain = [];

  for (const segment of segments) {
    if (current === null || current === undefined) return null;

    if (Array.isArray(current)) {
      let index = Number(segment);
      if (!Number.isInteger(index) || index < 0 || index >= current.length) {
        index = current.findIndex(
          (item, i) =>
            String(i) === segment ||
            (item && typeof item === 'object' && (String(item.id) === segment || String(item.name) === segment)),
        );
      }
      if (index < 0) return null;
      parent = current;
      parentKey = index;
      current = current[index];
      chain.push({ type: 'array', index, segment });
      continue;
    }

    if (typeof current === 'object') {
      if (!(segment in current)) return null;
      parent = current;
      parentKey = segment;
      current = current[segment];
      chain.push({ type: 'object', key: segment });
      continue;
    }

    return null;
  }

  return { segments, value: current, parent, parentKey, chain };
}

function detectBinding(path) {
  const parts = parsePath(path);
  if (!parts.length) return null;

  const candidates = [];
  for (let i = 1; i <= Math.min(2, parts.length); i += 1) {
    candidates.push(parts.slice(0, i).join('.'));
  }
  candidates.reverse();

  for (const key of candidates) {
    if (MODULE_BINDINGS[key]) return { rootKey: key, ...MODULE_BINDINGS[key] };
  }
  return null;
}

function cleanValueBySchema(schemaKey, fieldName) {
  const schema = schemas[schemaKey];
  const defaults = schema?.defaults || {};
  if (Object.prototype.hasOwnProperty.call(defaults, fieldName)) return defaults[fieldName];
  return null;
}

async function logActivity(action, entityType, entityId, metadata) {
  await useActivityStore.getState().logActivity({
    type: 'canvas',
    action,
    entityType,
    entityId: entityId || 'unknown',
    metadata: metadata || {},
  });
}

async function cleanupEntityReferences(removedId) {
  if (!removedId) return;
  const stores = Object.values(STORES);
  const linkedKeys = new Set([
    'linkedGoalIds',
    'linkedTaskIds',
    'linkedScheduleIds',
    'linkedJournalIds',
    'linkedEntityIds',
  ]);

  for (const storeName of stores) {
    const rows = await localDb.getAll(storeName);
    for (const row of rows) {
      const next = cleanupObjectReferences(row, removedId, linkedKeys);
      if (next !== row) {
        await localDb.put(storeName, next);
      }
    }
  }
}

function cleanupObjectReferences(input, removedId, linkedKeys) {
  if (Array.isArray(input)) {
    let changed = false;
    const mapped = input.map((entry) => {
      const cleaned = cleanupObjectReferences(entry, removedId, linkedKeys);
      if (cleaned !== entry) changed = true;
      return cleaned;
    });
    return changed ? mapped : input;
  }

  if (!input || typeof input !== 'object') return input;

  let changed = false;
  const out = { ...input };
  for (const [key, value] of Object.entries(input)) {
    if (Array.isArray(value) && linkedKeys.has(key)) {
      const filtered = value.filter((id) => id !== removedId);
      if (filtered.length !== value.length) {
        out[key] = filtered;
        changed = true;
      }
      continue;
    }
    if (typeof value === 'string' && key.toLowerCase().endsWith('id') && value === removedId) {
      out[key] = null;
      changed = true;
      continue;
    }
    if (value && typeof value === 'object') {
      const cleaned = cleanupObjectReferences(value, removedId, linkedKeys);
      if (cleaned !== value) {
        out[key] = cleaned;
        changed = true;
      }
    }
  }
  return changed ? out : input;
}

async function refreshAllStores() {
  await Promise.all([
    useTaskStore.getState().refreshFromDb(),
    useGoalStore.getState().hydrate(),
    useJournalStore.getState().hydrate(),
    useFinanceStore.getState().hydrate(),
    useFitnessStore.getState().hydrate(),
    useCrmStore.getState().hydrate(),
    useAcademicStore.getState().hydrate(),
    useScheduleStore.getState().hydrate(),
    useChatStore.getState().hydrate(),
    useProfileStore.getState().hydrate(),
  ]);
}

function removeEntityFromLocalStore(binding, entityId) {
  if (!entityId) return;
  if (binding.rootKey === 'tasks') {
    useTaskStore.setState((state) => ({ tasks: state.tasks.filter((item) => item.id !== entityId) }));
    return;
  }
  if (binding.rootKey === 'goals') {
    useGoalStore.setState((state) => ({ goals: state.goals.filter((item) => item.id !== entityId) }));
    return;
  }
  if (binding.rootKey === 'journal.entries') {
    useJournalStore.setState((state) => ({ entries: state.entries.filter((item) => item.id !== entityId) }));
    return;
  }
  if (binding.rootKey === 'finance.transactions') {
    useFinanceStore.setState((state) => ({ transactions: state.transactions.filter((item) => item.id !== entityId) }));
    return;
  }
  if (binding.rootKey === 'fitness.workouts') {
    useFitnessStore.setState((state) => ({ workouts: state.workouts.filter((item) => item.id !== entityId) }));
    return;
  }
  if (binding.rootKey === 'fitness.meals') {
    useFitnessStore.setState((state) => ({ meals: state.meals.filter((item) => item.id !== entityId) }));
    return;
  }
  if (binding.rootKey === 'fitness.hydrationLogs') {
    useFitnessStore.setState((state) => ({ hydrationLogs: state.hydrationLogs.filter((item) => item.id !== entityId) }));
    return;
  }
  if (binding.rootKey === 'crm.contacts') {
    useCrmStore.setState((state) => ({ contacts: state.contacts.filter((item) => item.id !== entityId) }));
    return;
  }
  if (binding.rootKey === 'academics.subjects') {
    useAcademicStore.setState((state) => ({ subjects: state.subjects.filter((item) => item.id !== entityId) }));
    return;
  }
  if (binding.rootKey === 'schedules') {
    useScheduleStore.setState((state) => ({ schedules: state.schedules.filter((item) => item.id !== entityId) }));
    return;
  }
  if (binding.rootKey === 'chats') {
    useChatStore.setState((state) => ({ chatHistory: state.chatHistory.filter((item) => item.id !== entityId) }));
  }
}

export function getNodeSnapshot(combinedState, path) {
  const binding = detectBinding(path);
  const resolved = resolvePath(combinedState, path);
  return {
    path,
    binding,
    resolved,
    value: resolved?.value,
  };
}

export async function updateNodeAtPath({ path, combinedState, nextValue }) {
  const snapshot = getNodeSnapshot(combinedState, path);
  if (!snapshot.binding || !snapshot.resolved) return false;

  const { binding, resolved } = snapshot;
  const rootPathParts = parsePath(binding.rootKey);
  const fullParts = parsePath(path);
  const relativeParts = fullParts.slice(rootPathParts.length);

  if (binding.collection) {
    if (!relativeParts.length) return false;
    const entityId = relativeParts[0];
    const record = await localDb.getById(binding.store, entityId);
    if (!record) return false;

    if (relativeParts.length === 1) {
      await localDb.put(binding.store, { ...record, ...nextValue });
      await logActivity('entity_updated', binding.entityType, entityId, { path });
      await refreshAllStores();
      return true;
    }

    const base = structuredClone(record);
    const targetPath = relativeParts.slice(1).join('.');
    const target = resolvePath(base, targetPath);
    if (!target || !target.parent) return false;
    target.parent[target.parentKey] = nextValue;
    await localDb.put(binding.store, base);
    await logActivity('field_updated', binding.entityType, entityId, { path, field: target.parentKey });
    await refreshAllStores();
    return true;
  }

  const singletonId = binding.fixedId || useProfileStore.getState().profile?.id || 'root-profile';
  const singleton = await localDb.getById(binding.store, singletonId);
  const base = structuredClone(singleton || { id: singletonId });
  if (!relativeParts.length) {
    await localDb.put(binding.store, { ...base, ...nextValue });
    await logActivity('entity_updated', binding.entityType, singletonId, { path });
    await refreshAllStores();
    return true;
  }
  const target = resolvePath(base, relativeParts.join('.'));
  if (!target || !target.parent) return false;
  target.parent[target.parentKey] = nextValue;
  await localDb.put(binding.store, base);
  await logActivity('field_updated', binding.entityType, singletonId, { path, field: target.parentKey });
  await refreshAllStores();
  return true;
}

export async function deleteNodeAtPath({ path, combinedState }) {
  const snapshot = getNodeSnapshot(combinedState, path);
  if (!snapshot.binding || !snapshot.resolved) return false;

  const { binding } = snapshot;
  const rootPathParts = parsePath(binding.rootKey);
  const fullParts = parsePath(path);
  const relativeParts = fullParts.slice(rootPathParts.length);

  if (binding.collection) {
    if (!relativeParts.length) return false;
    const entityId = relativeParts[0];
    const record = await localDb.getById(binding.store, entityId);
    if (!record) return false;

    if (relativeParts.length === 1) {
      removeEntityFromLocalStore(binding, entityId);
      await localDb.delete(binding.store, entityId);
      await cleanupEntityReferences(entityId);
      await logActivity('entity_deleted', binding.entityType, entityId, { path });
      await logActivity('relationship_removed', binding.entityType, entityId, { removedId: entityId });
      await refreshAllStores();
      return true;
    }

    const base = structuredClone(record);
    const targetPath = relativeParts.slice(1).join('.');
    const target = resolvePath(base, targetPath);
    if (!target || !target.parent) return false;

    if (Array.isArray(target.parent)) {
      target.parent.splice(target.parentKey, 1);
    } else {
      const fieldName = String(target.parentKey);
      target.parent[target.parentKey] = cleanValueBySchema(binding.schemaKey, fieldName);
    }

    await localDb.put(binding.store, base);
    await logActivity('field_updated', binding.entityType, entityId, { path, action: 'delete_field' });
    await refreshAllStores();
    return true;
  }

  const singletonId = binding.fixedId || useProfileStore.getState().profile?.id || 'root-profile';
  const singleton = await localDb.getById(binding.store, singletonId);
  if (!singleton) return false;
  const base = structuredClone(singleton);

  if (!relativeParts.length) return false;
  const target = resolvePath(base, relativeParts.join('.'));
  if (!target || !target.parent) return false;

  if (Array.isArray(target.parent)) {
    target.parent.splice(target.parentKey, 1);
  } else {
    target.parent[target.parentKey] = null;
  }

  await localDb.put(binding.store, base);
  await logActivity('field_updated', binding.entityType, singletonId, { path, action: 'delete_field' });
  await refreshAllStores();
  return true;
}
