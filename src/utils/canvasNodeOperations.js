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
import { useSelfCareStore } from '../store/selfCareStore';
import { useCommunicationStore } from '../store/communicationStore';
import { useSocialGrowthStore } from '../store/socialGrowthStore';
import { usePublicPersonaStore } from '../store/publicPersonaStore';
import { useMusicStore } from '../store/musicStore';
import { useWritingStore } from '../store/writingStore';
import { useReadingStore } from '../store/readingStore';
import { useVaultStore } from '../store/vaultStore';
import { cleanupEntityReferences } from './entityCleanup';

const MODULE_BINDINGS = {
  tasks: { store: STORES.TASKS, schemaKey: 'tasks', entityType: 'task', collection: true },
  goals: { store: STORES.GOALS, schemaKey: 'goals', entityType: 'goal', collection: true },
  'journal.entries': { store: STORES.JOURNAL_ENTRIES, schemaKey: 'journalEntries', entityType: 'journal_entry', collection: true },
  'finance.transactions': { store: STORES.FINANCE_TRANSACTIONS, schemaKey: 'financeTransactions', entityType: 'transaction', collection: true },
  'finance.accounts': { store: STORES.FINANCE_TRANSACTIONS, schemaKey: 'financeTransactions', entityType: 'transaction', collection: true },
  'finance.mutualFunds': { store: STORES.MUTUAL_FUNDS, schemaKey: 'financeTransactions', entityType: 'mutual_fund', collection: true },
  'fitness.workouts': { store: STORES.FITNESS_LOGS, schemaKey: 'fitnessLogs', entityType: 'fitness_log', collection: true },
  'fitness.meals': { store: STORES.FITNESS_LOGS, schemaKey: 'fitnessLogs', entityType: 'fitness_log', collection: true },
  'fitness.hydrationLogs': { store: STORES.FITNESS_LOGS, schemaKey: 'fitnessLogs', entityType: 'fitness_log', collection: true },
  'crm.contacts': { store: STORES.CRM_CONTACTS, schemaKey: 'crmContacts', entityType: 'contact', collection: true },
  'academics.subjects': { store: STORES.ACADEMIC_SUBJECTS, schemaKey: 'academicSubjects', entityType: 'academic_subject', collection: true },
  schedules: { store: STORES.SCHEDULES, schemaKey: 'schedules', entityType: 'schedule', collection: true },
  chats: { store: STORES.CHATS, schemaKey: 'chats', entityType: 'chat', collection: true },
  profile: { store: STORES.PROFILE, schemaKey: 'profile', entityType: 'profile', collection: false, fixedId: 'root-profile' },
  'personal.selfCare': { store: STORES.PERSONAL_SELF_CARE, schemaKey: 'personalSelfCare', entityType: 'self_care', collection: true },
  'personal.communication': { store: STORES.PERSONAL_COMMUNICATION, schemaKey: 'personalCommunication', entityType: 'communication', collection: true },
  'personal.socialGrowth': { store: STORES.PERSONAL_SOCIAL_GROWTH, schemaKey: 'personalSocialGrowth', entityType: 'social_growth', collection: true },
  'personal.publicPersona': { store: STORES.PERSONAL_PUBLIC_PERSONA, schemaKey: 'personalPublicPersona', entityType: 'public_persona', collection: true },
  'personal.music': { store: STORES.PERSONAL_MUSIC, schemaKey: 'personalMusic', entityType: 'music_log', collection: true },
  'personal.writing': { store: STORES.PERSONAL_WRITING, schemaKey: 'personalWriting', entityType: 'writing_draft', collection: true },
  'personal.reading': { store: STORES.PERSONAL_READING, schemaKey: 'personalReading', entityType: 'reading_item', collection: true },
  'personal.vault': { store: STORES.PERSONAL_VAULT, schemaKey: 'personalVault', entityType: 'vault_idea', collection: true },
};

function parsePath(path) {
  return String(path || '').split('.').filter(Boolean);
}

function resolvePath(data, path) {
  let segments = parsePath(path);
  if (!segments.length) return null;

  // Tree-to-Store Path Normalization for Academics Subjects branch
  if (segments[0] === 'academics' && segments[1] === 'subjects' && segments.length >= 4) {
    const sem = segments[2];
    const subId = segments[3];
    const subjects = data?.academics?.subjects || [];
    const subIndex = subjects.findIndex(s => String(s.id) === subId || String(s.name) === subId);
    
    if (subIndex >= 0) {
      const mapped = ['academics', 'subjects', String(subIndex)];
      const subObj = subjects[subIndex];
      
      if (segments.length === 4) {
        segments = mapped;
      } else {
        const remaining = segments.slice(4);
        const nextSeg = remaining[0];
        
        // Let's check if nextSeg is a unit ID (starting with 'u-') or in units array
        const units = subObj.units || [];
        const unitIndex = units.findIndex(u => String(u.id) === nextSeg || String(u.name) === nextSeg);
        
        if (unitIndex >= 0) {
          mapped.push('units', String(unitIndex));
          
          if (remaining.length === 1) {
            segments = mapped;
          } else {
            const topicSeg = remaining[1];
            const topics = units[unitIndex].topics || [];
            const topicIndex = topics.findIndex(t => String(t.id) === topicSeg || String(t.name) === topicSeg);
            
            if (topicIndex >= 0) {
              mapped.push('topics', String(topicIndex));
              
              if (remaining.length === 2) {
                segments = mapped;
              } else {
                const subtopicSeg = remaining[2]; // e.g. 'st0'
                if (subtopicSeg.startsWith('st')) {
                  const stIdx = parseInt(subtopicSeg.replace('st', ''), 10);
                  if (!isNaN(stIdx)) {
                    mapped.push('subtopics', String(stIdx));
                    segments = mapped;
                  }
                }
              }
            }
          }
        } else {
          // Standard fields on subject: e.g. 'vivaPrep', 'attendance', 'internalMarks', 'syllabus', 'revisionStatus'
          mapped.push(nextSeg);
          segments = mapped;
        }
      }
    }
  }

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
    useSelfCareStore.getState().hydrate(),
    useCommunicationStore.getState().hydrate(),
    useSocialGrowthStore.getState().hydrate(),
    usePublicPersonaStore.getState().hydrate(),
    useMusicStore.getState().hydrate(),
    useWritingStore.getState().hydrate(),
    useReadingStore.getState().hydrate(),
    useVaultStore.getState().hydrate(),
  ]);
}

function getActualStore(bindingStore, fullParts) {
  if (bindingStore === STORES.TASKS) {
    if (fullParts.includes('repetitive')) {
      if (fullParts.includes('active')) return STORES.REPETITIVE_TASKS;
      if (fullParts.includes('history')) return STORES.REPETITIVE_HISTORY;
    }
  }
  return bindingStore;
}

function removeEntityFromLocalStore(binding, entityId, fullParts = []) {
  if (!entityId) return;
  const store = getActualStore(binding.store, fullParts);
  
  if (store === STORES.TASKS) {
    useTaskStore.setState((state) => ({ tasks: state.tasks.filter((item) => item.id !== entityId) }));
    return;
  }
  if (store === STORES.REPETITIVE_TASKS) {
    useTaskStore.setState((state) => ({ repetitiveTasks: state.repetitiveTasks.filter((item) => item.id !== entityId) }));
    return;
  }
  if (store === STORES.REPETITIVE_HISTORY) {
    useTaskStore.setState((state) => ({ repetitiveHistory: state.repetitiveHistory.filter((item) => item.id !== entityId) }));
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
  if (binding.rootKey === 'finance.transactions' || binding.rootKey === 'finance.accounts') {
    useFinanceStore.setState((state) => ({ transactions: state.transactions.filter((item) => item.id !== entityId) }));
    return;
  }
  if (binding.rootKey === 'finance.mutualFunds') {
    useMutualFundStore.setState((state) => ({ funds: state.funds.filter((item) => item.id !== entityId) }));
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
    return;
  }
  if (binding.rootKey === 'personal.selfCare') {
    useSelfCareStore.setState((state) => ({ routines: state.routines.filter((item) => item.id !== entityId) }));
    return;
  }
  if (binding.rootKey === 'personal.communication') {
    useCommunicationStore.setState((state) => ({ logs: state.logs.filter((item) => item.id !== entityId) }));
    return;
  }
  if (binding.rootKey === 'personal.socialGrowth') {
    useSocialGrowthStore.setState((state) => ({ records: state.records.filter((item) => item.id !== entityId) }));
    return;
  }
  if (binding.rootKey === 'personal.publicPersona') {
    usePublicPersonaStore.setState((state) => ({ platforms: state.platforms.filter((item) => item.id !== entityId) }));
    return;
  }
  if (binding.rootKey === 'personal.music') {
    useMusicStore.setState((state) => ({ practiceLogs: state.practiceLogs.filter((item) => item.id !== entityId) }));
    return;
  }
  if (binding.rootKey === 'personal.writing') {
    useWritingStore.setState((state) => ({ drafts: state.drafts.filter((item) => item.id !== entityId) }));
    return;
  }
  if (binding.rootKey === 'personal.reading') {
    useReadingStore.setState((state) => ({ library: state.library.filter((item) => item.id !== entityId) }));
    return;
  }
  if (binding.rootKey === 'personal.vault') {
    useVaultStore.setState((state) => ({ ideas: state.ideas.filter((item) => item.id !== entityId) }));
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

async function extractEntityId(storeName, pathSegments) {
  const allItems = await localDb.getAll(storeName);
  const allIds = new Set(allItems.map(item => String(item.id)));
  
  for (let i = pathSegments.length - 1; i >= 0; i--) {
    if (allIds.has(pathSegments[i])) {
      return pathSegments[i];
    }
  }
  return null;
}

export async function updateNodeAtPath({ path, combinedState, nextValue }) {
  const snapshot = getNodeSnapshot(combinedState, path);
  if (!snapshot.binding) return false;

  const { binding } = snapshot;
  const rootPathParts = parsePath(binding.rootKey);
  const fullParts = parsePath(path);
  const relativeParts = fullParts.slice(rootPathParts.length);

  if (binding.collection) {
    const store = getActualStore(binding.store, fullParts);
    const entityId = await extractEntityId(store, fullParts);
    if (!entityId) return false;
    const record = await localDb.getById(store, entityId);
    if (!record) return false;

    const entityIdx = fullParts.indexOf(entityId);
    const fieldParts = fullParts.slice(entityIdx + 1);

    if (fieldParts.length === 0) {
      await localDb.put(store, { ...record, ...nextValue });
      await logActivity('entity_updated', binding.entityType, entityId, { path });
      await refreshAllStores();
      return true;
    }

    if (fieldParts.join('.') === 'attendance') {
      const updated = {
        ...record,
        attendedDays: Number(nextValue.attendedDays) || 0,
        totalDays: Number(nextValue.totalDays) || 0,
      };
      await localDb.put(store, updated);
      await logActivity('field_updated', binding.entityType, entityId, { path, field: 'attendance' });
      await refreshAllStores();
      return true;
    }

    const base = structuredClone(record);
    const targetPath = fieldParts.join('.');
    const target = resolvePath(base, targetPath);
    if (!target || !target.parent) return false;
    target.parent[target.parentKey] = nextValue;
    await localDb.put(store, base);
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
  if (!snapshot.binding) return false;

  const { binding } = snapshot;
  const rootPathParts = parsePath(binding.rootKey);
  const fullParts = parsePath(path);
  const relativeParts = fullParts.slice(rootPathParts.length);

  if (binding.collection) {
    const store = getActualStore(binding.store, fullParts);
    const entityId = await extractEntityId(store, fullParts);
    if (!entityId) return false;
    const record = await localDb.getById(store, entityId);
    if (!record) return false;

    const entityIdx = fullParts.indexOf(entityId);
    const fieldParts = fullParts.slice(entityIdx + 1);

    if (fieldParts.length === 0) {
      removeEntityFromLocalStore(binding, entityId, fullParts);
      await localDb.delete(store, entityId);
      try {
        await cleanupEntityReferences(entityId);
      } catch (err) {
        console.warn('[Canvas] Reference cleanup failed:', err);
      }
      await logActivity('entity_deleted', binding.entityType, entityId, { path });
      await logActivity('relationship_removed', binding.entityType, entityId, { removedId: entityId });
      await refreshAllStores();
      return true;
    }

    const base = structuredClone(record);
    const targetPath = fieldParts.join('.');
    const target = resolvePath(base, targetPath);
    if (!target || !target.parent) return false;

    if (Array.isArray(target.parent)) {
      target.parent.splice(target.parentKey, 1);
    } else {
      const fieldName = String(target.parentKey);
      target.parent[target.parentKey] = cleanValueBySchema(binding.schemaKey, fieldName);
    }

    await localDb.put(store, base);
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
