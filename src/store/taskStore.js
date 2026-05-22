import { create } from 'zustand';
import { taskService } from '../database/services/taskService';
import { goalService } from '../database/services/goalService';
import { journalService } from '../database/services/journalService';
import { financeService } from '../database/services/financeService';
import { localDb, STORES } from '../database/core/localDatabase';
import { deepClone } from '../utils/deepClone';
import { useActivityStore } from './activityStore';

const TASK_BUCKETS = ['today', 'week', 'month', 'undefined', 'completed'];
const PRIORITY_VALUES = ['low', 'medium', 'high', 'critical'];
const DEMO_TASK_IDS = new Set(['task-001', 'task-002', 'task-003']);
const FULL_PURGE_FLAG = 'jarvis_tasks_full_purge_v1';

const initialState = {
  tasks: [],
  searchQuery: '',
  activeCategory: 'All',
  activePriority: 'All',
  collapsedSections: {
    today: false,
    week: false,
    month: false,
    overdue: false,
    undefined: false,
    completed: false,
  },
  expandedTaskIds: {},
  isHydrated: false,
};

function dedupeIds(ids) {
  return Array.from(new Set((ids || []).filter(Boolean)));
}

function uniqueTasksById(tasks = []) {
  const seen = new Set();
  const out = [];
  for (const task of tasks) {
    if (!task?.id || seen.has(task.id)) continue;
    seen.add(task.id);
    out.push(task);
  }
  return out;
}

function normalizePriority(priority) {
  const next = String(priority || '').toLowerCase();
  return PRIORITY_VALUES.includes(next) ? next : 'medium';
}

function dayKey(input) {
  return new Date(input || Date.now()).toISOString().slice(0, 10);
}

function startOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function inferBucketFromDueDate(dueDate) {
  if (!dueDate) return 'undefined';
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return 'undefined';

  const today = startOfToday();
  const dueStart = new Date(due);
  dueStart.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((dueStart - today) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'today';
  if (diffDays > 0 && diffDays <= 7) return 'week';

  if (
    dueStart.getFullYear() === today.getFullYear() &&
    dueStart.getMonth() === today.getMonth()
  ) {
    return 'month';
  }

  return 'month';
}

function normalizeBucket(rawBucket, dueDate, completed) {
  if (completed) return 'completed';
  const next = String(rawBucket || '').toLowerCase();
  if (TASK_BUCKETS.includes(next) && next !== 'completed') return next;
  return inferBucketFromDueDate(dueDate);
}

function normalizeTask(task = {}) {
  const dueDate = task.dueDate || task.deadline || null;
  const completed = Boolean(task.completed || task.status === 'completed' || task.bucket === 'completed');
  const bucket = normalizeBucket(task.bucket || task.status, dueDate, completed);
  const originalBucket = normalizeBucket(task.originalBucket, dueDate, false);

  return {
    ...task,
    title: task.title?.trim() || 'Untitled task',
    description: task.description?.trim() || '',
    createdAt: task.createdAt || new Date().toISOString(),
    dueDate,
    completedAt: completed ? task.completedAt || new Date().toISOString() : null,
    originalBucket,
    bucket,
    progress: completed ? 100 : Math.max(0, Math.min(100, Number(task.progress) || 0)),
    completed,
    priority: normalizePriority(task.priority),
    category: task.category || 'System',
    subTags: dedupeIds(task.subTags || task.tags || []),
    linkedGoalIds: dedupeIds(task.linkedGoalIds || (task.linkedGoal ? [task.linkedGoal] : [])),
    linkedJournalIds: dedupeIds(task.linkedJournalIds || (task.linkedTaskId ? [task.linkedTaskId] : [])),
    linkedAcademicIds: dedupeIds(task.linkedAcademicIds || task.linkedSubjectIds),
    linkedScheduleIds: dedupeIds(task.linkedScheduleIds || (task.scheduleId ? [task.scheduleId] : [])),
    completionNotes: task.completionNotes || '',
    archived: Boolean(task.archived),
    updatedAt: new Date().toISOString(),
  };
}

function getDropDueDate(targetBucket) {
  const now = new Date();
  if (targetBucket === 'today') return now.toISOString();
  if (targetBucket === 'week') {
    const due = new Date(now);
    due.setDate(due.getDate() + 7);
    return due.toISOString();
  }
  if (targetBucket === 'month') {
    const due = new Date(now);
    due.setMonth(due.getMonth() + 1);
    return due.toISOString();
  }
  return null;
}

async function withActivity(action, entityId, metadata = {}) {
  try {
    return await useActivityStore.getState().logActivity({
      type: 'task',
      action,
      entityType: 'task',
      entityId,
      metadata,
    });
  } catch (err) {
    console.warn('Task activity log failed:', err);
    return null;
  }
}

export const useTaskStore = create((set, get) => ({
  ...deepClone(initialState),

  refreshFromDb: async () => {
    try {
      const tasks = uniqueTasksById((await taskService.getAll()).map(normalizeTask));
      set({ tasks, isHydrated: true });
    } catch (err) {
      console.error('Failed to refresh tasks from db:', err);
    }
  },

  hydrate: async () => {
    try {
      let tasks = await taskService.getAll();
      tasks = uniqueTasksById(tasks.map(normalizeTask));
      set({ tasks, isHydrated: true });
      await get().removeDemoTasksSafely();
      await get().purgeAllTasksSafelyOnce();
    } catch (err) {
      console.error('Failed to hydrate tasks:', err);
    }
  },

  purgeAllTasksSafelyOnce: async () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage.getItem(FULL_PURGE_FLAG) === 'done') {
        return;
      }
      await get().purgeAllTasksSafely();
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(FULL_PURGE_FLAG, 'done');
      }
    } catch (err) {
      console.error('Failed to purge all tasks safely:', err);
    }
  },

  purgeAllTasksSafely: async () => {
    const allTaskIds = new Set(get().tasks.map((task) => task.id).filter(Boolean));

    const goals = await goalService.getAll();
    for (const goal of goals) {
      const linkedTaskIds = [];
      const objectives = (goal.objectives || []).map((objective) => ({ ...objective, taskIds: [] }));
      if ((goal.linkedTaskIds || []).length > 0 || (goal.objectives || []).some((o) => (o.taskIds || []).length > 0)) {
        await goalService.update(goal.id, { ...goal, linkedTaskIds, objectives });
      }
    }

    const journalEntries = await journalService.getAll();
    for (const entry of journalEntries) {
      if (entry.linkedTaskId) {
        await journalService.update(entry.id, { ...entry, linkedTaskId: null });
      }
    }

    const transactions = await financeService.getAll();
    for (const transaction of transactions) {
      if (transaction.linkedTaskId) {
        await financeService.update(transaction.id, { ...transaction, linkedTaskId: null });
      }
    }

    const schedules = await localDb.getAll(STORES.SCHEDULES);
    for (const schedule of schedules) {
      if ((schedule.taskIds || []).length > 0) {
        await localDb.put(STORES.SCHEDULES, { ...schedule, taskIds: [] });
      }
    }

    await localDb.clear(STORES.TASKS);
    set({ tasks: [] });
    await withActivity('deleted', 'all-tasks-purge', { removedCount: allTaskIds.size, mode: 'full-safe-purge' });
  },

  removeDemoTasksSafely: async () => {
    const currentTasks = get().tasks;
    const demoTasks = currentTasks.filter((task) => DEMO_TASK_IDS.has(task.id));
    if (!demoTasks.length) return;

    const demoTaskIds = new Set(demoTasks.map((task) => task.id));

    const goals = await goalService.getAll();
    for (const goal of goals) {
      const linkedTaskIds = (goal.linkedTaskIds || []).filter((id) => !demoTaskIds.has(id));
      const objectives = (goal.objectives || []).map((objective) => ({
        ...objective,
        taskIds: (objective.taskIds || []).filter((id) => !demoTaskIds.has(id)),
      }));
      if (linkedTaskIds.length !== (goal.linkedTaskIds || []).length || JSON.stringify(objectives) !== JSON.stringify(goal.objectives || [])) {
        await goalService.update(goal.id, { ...goal, linkedTaskIds, objectives });
      }
    }

    const journalEntries = await journalService.getAll();
    for (const entry of journalEntries) {
      if (entry.linkedTaskId && demoTaskIds.has(entry.linkedTaskId)) {
        await journalService.update(entry.id, { ...entry, linkedTaskId: null });
      }
    }

    const transactions = await financeService.getAll();
    for (const transaction of transactions) {
      if (transaction.linkedTaskId && demoTaskIds.has(transaction.linkedTaskId)) {
        await financeService.update(transaction.id, { ...transaction, linkedTaskId: null });
      }
    }

    const schedules = await localDb.getAll(STORES.SCHEDULES);
    for (const schedule of schedules) {
      const filtered = (schedule.taskIds || []).filter((id) => !demoTaskIds.has(id));
      if (filtered.length !== (schedule.taskIds || []).length) {
        await localDb.put(STORES.SCHEDULES, { ...schedule, taskIds: filtered });
      }
    }

    for (const task of demoTasks) {
      await taskService.delete(task.id);
    }

    set((state) => ({ tasks: state.tasks.filter((task) => !demoTaskIds.has(task.id)) }));
    await withActivity('demo_tasks_purged', 'seed-cleanup', { removed: Array.from(demoTaskIds) });
  },

  setSearchQuery: (value) => set({ searchQuery: value }),
  setActiveCategory: (value) => set({ activeCategory: value }),
  setActivePriority: (value) => set({ activePriority: value }),

  toggleSectionCollapsed: (section) =>
    set((state) => ({
      collapsedSections: {
        ...state.collapsedSections,
        [section]: !state.collapsedSections[section],
      },
    })),

  toggleTaskExpanded: (taskId) =>
    set((state) => ({
      expandedTaskIds: {
        ...state.expandedTaskIds,
        [taskId]: !state.expandedTaskIds[taskId],
      },
    })),

  createTask: async (input) => {
    const draft = normalizeTask({ ...input, createdAt: new Date().toISOString() });
    const savedTask = normalizeTask(await taskService.create(draft));
    set((state) => ({ tasks: uniqueTasksById([savedTask, ...state.tasks]) }));
    await withActivity('created', savedTask.id, { title: savedTask.title, bucket: savedTask.bucket });
    return savedTask;
  },

  updateTask: async (taskId, updates) => {
    const task = get().tasks.find((item) => item.id === taskId);
    if (!task) return null;

    const merged = normalizeTask({ ...task, ...updates, updatedAt: new Date().toISOString() });
    const savedTask = normalizeTask(await taskService.update(taskId, merged));
    set((state) => ({ tasks: state.tasks.map((item) => (item.id === taskId ? savedTask : item)) }));
    await withActivity('updated', taskId, { title: savedTask.title, bucket: savedTask.bucket });
    return savedTask;
  },

  deleteTask: async (taskId) => {
    const task = get().tasks.find((item) => item.id === taskId);
    await taskService.delete(taskId);
    set((state) => {
      const idx = state.tasks.findIndex((item) => item.id === taskId);
      if (idx === -1) return state;
      const next = state.tasks.slice();
      next.splice(idx, 1);
      return { tasks: next };
    });
    await withActivity('deleted', taskId, { title: task?.title || 'Task' });
  },

  markTaskComplete: async (taskId, completionNotes = '') => {
    const task = get().tasks.find((item) => item.id === taskId);
    if (!task) return null;
    const saved = await get().updateTask(taskId, {
      completed: true,
      completedAt: new Date().toISOString(),
      progress: 100,
      originalBucket: task.bucket === 'completed' ? task.originalBucket || inferBucketFromDueDate(task.dueDate) : task.bucket,
      bucket: 'completed',
      completionNotes: completionNotes || task.completionNotes || '',
    });
    await withActivity('completed', taskId, { title: task.title });
    return saved;
  },

  restoreTask: async (taskId) => {
    const task = get().tasks.find((item) => item.id === taskId);
    if (!task) return null;
    const restoredBucket = normalizeBucket(task.originalBucket, task.dueDate, false);
    const saved = await get().updateTask(taskId, {
      completed: false,
      completedAt: null,
      progress: 0,
      bucket: restoredBucket,
    });
    await withActivity('restored', taskId, { title: task.title, restoredBucket });
    return saved;
  },

  toggleTaskCompletion: async (taskId) => {
    const task = get().tasks.find((item) => item.id === taskId);
    if (!task) return null;
    if (task.completed || task.bucket === 'completed') return get().restoreTask(taskId);
    return get().markTaskComplete(taskId);
  },

  moveTaskToBucket: async (taskId, targetBucket) => {
    const task = get().tasks.find((item) => item.id === taskId);
    if (!task || !TASK_BUCKETS.includes(targetBucket)) return null;

    if (targetBucket === 'completed') {
      return get().markTaskComplete(taskId);
    }

    const dueDate = targetBucket === 'undefined' ? null : getDropDueDate(targetBucket);
    const saved = await get().updateTask(taskId, {
      completed: false,
      completedAt: null,
      bucket: targetBucket,
      originalBucket: targetBucket,
      dueDate,
    });
    await withActivity('moved', taskId, { from: task.bucket, to: targetBucket, mode: 'drag-drop' });
    await withActivity('drag_drop_bucket_changed', taskId, { from: task.bucket, to: targetBucket });
    return saved;
  },

  updateTaskProgress: async (taskId, progress) => {
    const next = Math.max(0, Math.min(100, Number(progress) || 0));
    if (next >= 100) return get().markTaskComplete(taskId);
    return get().updateTask(taskId, { progress: next, completed: false, completedAt: null });
  },

  duplicateTask: async (taskId) => {
    const task = get().tasks.find((item) => item.id === taskId);
    if (!task) return null;
    const cloneInput = { ...task, title: `${task.title} (Copy)`, createdAt: new Date().toISOString(), completed: false, completedAt: null, progress: 0, bucket: normalizeBucket(task.originalBucket, task.dueDate, false) };
    delete cloneInput.id;
    const savedTask = await get().createTask(cloneInput);
    await withActivity('duplicated', savedTask.id, { sourceTaskId: taskId, title: savedTask.title });
    return savedTask;
  },

  addTask: async (taskData) => get().createTask(taskData),
}));
