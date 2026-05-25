import { create } from 'zustand';
import { taskService } from '../database/services/taskService';
import { goalService } from '../database/services/goalService';
import { journalService } from '../database/services/journalService';
import { financeService } from '../database/services/financeService';
import { repetitiveTaskService } from '../database/services/repetitiveTaskService';
import { localDb, STORES } from '../database/core/localDatabase';
import { deepClone } from '../utils/deepClone';
import { useActivityStore } from './activityStore';

const TASK_BUCKETS = ['today', 'week', 'month', 'undefined', 'completed'];
const PRIORITY_VALUES = ['low', 'medium', 'high', 'critical'];
const DEMO_TASK_IDS = new Set(['task-001', 'task-002', 'task-003']);
const FULL_PURGE_FLAG = 'jarvis_tasks_full_purge_v1';

const initialState = {
  tasks: [],
  repetitiveTasks: [],
  repetitiveHistory: [],
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
    repetitive: false,
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

function todayKey() {
  return new Date().toISOString().slice(0, 10);
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

async function withActivity(action, entityId, metadata = {}, type = 'task') {
  try {
    return await useActivityStore.getState().logActivity({
      type,
      action,
      entityType: type,
      entityId,
      metadata,
    });
  } catch (err) {
    console.warn(`${type} activity log failed:`, err);
    return null;
  }
}

export const useTaskStore = create((set, get) => ({
  ...deepClone(initialState),

  refreshFromDb: async () => {
    try {
      const tasks = uniqueTasksById((await taskService.getAll()).map(normalizeTask));
      const repetitiveTasks = await repetitiveTaskService.getAll();
      const repetitiveHistory = await repetitiveTaskService.getHistory();
      set({ 
        tasks, 
        repetitiveTasks, 
        repetitiveHistory: repetitiveHistory.sort((a, b) => b.date.localeCompare(a.date)),
        isHydrated: true 
      });
    } catch (err) {
      console.error('Failed to refresh tasks from db:', err);
    }
  },

  hydrate: async () => {
    try {
      let tasks = await taskService.getAll();
      tasks = uniqueTasksById(tasks.map(normalizeTask));
      
      const repetitiveTasks = await repetitiveTaskService.getAll();
      const repetitiveHistory = await repetitiveTaskService.getHistory();
      
      set({ 
        tasks, 
        repetitiveTasks,
        repetitiveHistory: repetitiveHistory.sort((a, b) => b.date.localeCompare(a.date)),
        isHydrated: true 
      });
      
      await get().dailyResetRepetitiveTasks();
      await get().removeDemoTasksSafely();
      await get().purgeAllTasksSafelyOnce();
    } catch (err) {
      console.error('Failed to hydrate tasks:', err);
    }
  },

  dailyResetRepetitiveTasks: async () => {
    const today = todayKey();
    const activeTasks = get().repetitiveTasks.filter(t => t.active && !t.archived);
    
    // 1. Process recent history (last 7 days) to ensure snapshots exist and missedIds are finalized
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().slice(0, 10);
      
      const dayHistory = await repetitiveTaskService.getHistoryByDate(dateKey);
      
      // For retroactive creation, we only consider tasks that existed on that day
      const tasksOnThatDay = activeTasks.filter(t => {
        const createdDate = t.createdAt ? t.createdAt.slice(0, 10) : '';
        return createdDate && createdDate <= dateKey;
      });

      if (dayHistory) {
        // Finalize missedIds: tasks in snapshot that weren't completed
        const completedIds = dayHistory.completedIds || [];
        const snapshot = dayHistory.snapshot || [];
        const actualMissedIds = snapshot
          .filter(t => !completedIds.includes(t.id))
          .map(t => t.id);
        
        if (JSON.stringify(dayHistory.missedIds) !== JSON.stringify(actualMissedIds)) {
          await repetitiveTaskService.saveHistory({
            ...dayHistory,
            missedIds: actualMissedIds
          });
        }
      } else if (tasksOnThatDay.length > 0) {
        // Create missing history entry retroactively
        const completedIds = tasksOnThatDay
          .filter(t => (t.completionHistory || []).includes(dateKey))
          .map(t => t.id);
        const missedIds = tasksOnThatDay
          .filter(t => !(t.completionHistory || []).includes(dateKey))
          .map(t => t.id);
          
        await repetitiveTaskService.saveHistory({
          id: dateKey,
          date: dateKey,
          completedIds,
          missedIds,
          snapshot: tasksOnThatDay
        });
      }
    }

    // 2. Initialize today's history if missing
    const historyToday = await repetitiveTaskService.getHistoryByDate(today);
    if (!historyToday) {
      await repetitiveTaskService.saveHistory({
        id: today,
        date: today,
        completedIds: [],
        missedIds: [], // Keep empty for today so they don't show as "missed" prematurely
        snapshot: activeTasks
      });
    }

    // Refresh history in state
    const newHistory = await repetitiveTaskService.getHistory();
    set({ repetitiveHistory: newHistory.sort((a, b) => b.date.localeCompare(a.date)) });
  },

  createRepetitiveTask: async (input) => {
    const id = `rep-${Date.now()}`;
    const task = {
      ...input,
      id,
      title: input?.title?.trim() || 'Untitled Repetitive Task',
      description: input?.description || '',
      tags: Array.isArray(input?.tags) ? input.tags : [],
      subTags: Array.isArray(input?.subTags) ? input.subTags : [],
      linkedGoalIds: Array.isArray(input?.linkedGoalIds) ? input.linkedGoalIds : [],
      linkedTaskIds: Array.isArray(input?.linkedTaskIds) ? input.linkedTaskIds : [],
      linkedHabitIds: Array.isArray(input?.linkedHabitIds) ? input.linkedHabitIds : [],
      notes: input?.notes || '',
      priority: normalizePriority(input?.priority),
      category: input?.category || 'Routine',
      active: true,
      archived: false,
      streak: 0,
      completionHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const saved = await repetitiveTaskService.create(task);
    set(state => ({ repetitiveTasks: [...state.repetitiveTasks, saved] }));
    
    // Update today's history snapshot to include this new task
    try {
      const today = todayKey();
      const history = await repetitiveTaskService.getHistoryByDate(today);
      if (history) {
        const updatedHistory = {
          ...history,
          snapshot: [...(history.snapshot || []), saved]
        };
        await repetitiveTaskService.saveHistory(updatedHistory);
        const allHistory = await repetitiveTaskService.getHistory();
        set({ repetitiveHistory: allHistory.sort((a, b) => b.date.localeCompare(a.date)) });
      }
    } catch (err) {
      console.error('Failed to update repetitive history after create:', err);
    }

    await withActivity('created', saved.id, { title: saved.title }, 'repetitiveTask');
    return saved;
  },

  toggleRepetitiveTaskCompletion: async (taskId) => {
    const today = todayKey();
    const tasks = get().repetitiveTasks;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const isCompleted = task.completionHistory.includes(today);
    let newHistory = [];
    if (isCompleted) {
      newHistory = task.completionHistory.filter(d => d !== today);
    } else {
      newHistory = [...task.completionHistory, today];
    }

    // Recalculate streak
    let streak = 0;
    const sortedDates = [...newHistory].sort((a, b) => b.localeCompare(a));
    let checkDate = new Date();
    // If not completed today, start checking from yesterday
    if (!newHistory.includes(today)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    for (const d of sortedDates) {
      const dKey = checkDate.toISOString().slice(0, 10);
      if (d === dKey) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (d < dKey) {
        break; // Gap found
      }
    }

    const updatedTask = { ...task, completionHistory: newHistory, streak, updatedAt: new Date().toISOString() };
    const saved = await repetitiveTaskService.update(taskId, updatedTask);
    
    set(state => ({ 
      repetitiveTasks: state.repetitiveTasks.map(t => t.id === taskId ? saved : t) 
    }));

    // Update history store
    const history = await repetitiveTaskService.getHistoryByDate(today);
    if (history) {
      const completedIds = isCompleted 
        ? (history.completedIds || []).filter(id => id !== taskId)
        : [...(history.completedIds || []), taskId];
      
      // Only update missedIds if it's NOT for today
      const missedIds = isCompleted
        ? (today === history.date ? (history.missedIds || []) : [...(history.missedIds || []), taskId])
        : (history.missedIds || []).filter(id => id !== taskId);
        
      const updatedHistory = { ...history, completedIds, missedIds };
      await repetitiveTaskService.saveHistory(updatedHistory);
      const allHistory = await repetitiveTaskService.getHistory();
      set({ repetitiveHistory: allHistory.sort((a, b) => b.date.localeCompare(a.date)) });
    }

    await withActivity(isCompleted ? 'uncompleted' : 'completed', taskId, { title: task.title }, 'repetitiveTask');
  },

  deleteRepetitiveTask: async (taskId) => {
    const task = get().repetitiveTasks.find(t => t.id === taskId);
    await repetitiveTaskService.delete(taskId);
    set(state => ({ repetitiveTasks: state.repetitiveTasks.filter(t => t.id !== taskId) }));
    await withActivity('deleted', taskId, { title: task?.title || 'Repetitive Task' }, 'repetitiveTask');
  },

  deleteRepetitiveHistoryEntry: async (date) => {
    if (!date) return;
    await repetitiveTaskService.deleteHistoryByDate(date);
    const allHistory = await repetitiveTaskService.getHistory();
    set({ repetitiveHistory: allHistory.sort((a, b) => b.date.localeCompare(a.date)) });
    await withActivity('deleted', date, { date }, 'repetitiveHistory');
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
