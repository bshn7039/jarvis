import { create } from 'zustand';
import { taskService } from '../database/services/taskService';
import { deepClone } from '../utils/deepClone';
import { useActivityStore } from './activityStore';

const STATUS_VALUES = ['backlog', 'planned', 'active', 'paused', 'completed', 'archived'];
const PRIORITY_VALUES = ['low', 'medium', 'high', 'critical'];
const ENERGY_VALUES = ['low', 'medium', 'high', 'deep'];

const initialState = {
  tasks: [],
  searchQuery: '',
  activeCategory: 'All',
  activePriority: 'All',
  collapsedSections: {
    Backlog: false,
    Planned: false,
    Active: false,
    Paused: false,
    Completed: false,
    Archived: true,
  },
  expandedTaskIds: {},
  isHydrated: false,
};

function dedupeIds(ids) {
  return Array.from(new Set((ids || []).filter(Boolean)));
}

function normalizeStatus(status, section) {
  const next = String(status || '').toLowerCase();
  if (STATUS_VALUES.includes(next)) return next;
  if (section === 'Completed') return 'completed';
  if (section === 'Someday' || section === 'Monthly') return 'backlog';
  if (section === 'Weekly') return 'planned';
  if (section === 'Today') return 'active';
  return 'planned';
}

function normalizePriority(priority) {
  const next = String(priority || '').toLowerCase();
  return PRIORITY_VALUES.includes(next) ? next : 'medium';
}

function normalizeEnergy(energy) {
  const next = String(energy || '').toLowerCase();
  return ENERGY_VALUES.includes(next) ? next : 'medium';
}

function sectionFromStatus(status) {
  if (status === 'backlog') return 'Backlog';
  if (status === 'planned') return 'Planned';
  if (status === 'active') return 'Active';
  if (status === 'paused') return 'Paused';
  if (status === 'completed') return 'Completed';
  return 'Archived';
}

function normalizeTask(task = {}) {
  const status = normalizeStatus(task.status, task.section);
  const progress = status === 'completed' ? 100 : Math.max(0, Math.min(100, Number(task.progress) || 0));

  return {
    ...task,
    title: task.title?.trim() || 'Untitled task',
    description: task.description?.trim() || '',
    status,
    section: sectionFromStatus(status),
    priority: normalizePriority(task.priority),
    energy: normalizeEnergy(task.energy),
    progress,
    linkedGoalIds: dedupeIds(task.linkedGoalIds || (task.linkedGoal ? [task.linkedGoal] : [])),
    linkedSubjectIds: dedupeIds(task.linkedSubjectIds),
    linkedScheduleIds: dedupeIds(task.linkedScheduleIds || (task.scheduleId ? [task.scheduleId] : [])),
    linkedJournalIds: dedupeIds(task.linkedJournalIds),
    linkedFinanceIds: dedupeIds(task.linkedFinanceIds),
    linkedContactIds: dedupeIds(task.linkedContactIds),
    deadline: task.deadline || null,
    tags: Array.isArray(task.tags) ? dedupeIds(task.tags) : [],
    archivedAt: status === 'archived' ? task.archivedAt || new Date().toISOString() : null,
    createdAt: task.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function withActivity(type, action, entityId, metadata = {}) {
  return useActivityStore.getState().logActivity({
    type,
    action,
    entityType: type,
    entityId,
    metadata,
  });
}

export const useTaskStore = create((set, get) => ({
  ...deepClone(initialState),

  hydrate: async () => {
    try {
      const tasks = await taskService.getAll();
      set({ tasks: tasks.map(normalizeTask), isHydrated: true });
    } catch (err) {
      console.error('Failed to hydrate tasks:', err);
    }
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
    const draft = normalizeTask({
      title: input.title,
      description: input.description,
      status: input.status || 'planned',
      category: input.category || 'System',
      priority: input.priority,
      energy: input.energy,
      deadline: input.deadline || null,
      estimatedTime: input.estimatedTime || '30m',
      tags: input.tags || [],
      progress: input.progress,
      linkedGoalIds: input.linkedGoalIds,
      linkedSubjectIds: input.linkedSubjectIds,
      linkedScheduleIds: input.linkedScheduleIds,
      linkedJournalIds: input.linkedJournalIds,
      linkedFinanceIds: input.linkedFinanceIds,
      linkedContactIds: input.linkedContactIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const savedTask = normalizeTask(await taskService.create(draft));
    set((state) => ({ tasks: [savedTask, ...state.tasks] }));
    await withActivity('task', 'created', savedTask.id, { title: savedTask.title });
    return savedTask;
  },

  updateTask: async (taskId, updates) => {
    const task = get().tasks.find((item) => item.id === taskId);
    if (!task) return null;

    const merged = normalizeTask({ ...task, ...updates, updatedAt: new Date().toISOString() });
    const savedTask = normalizeTask(await taskService.update(taskId, merged));
    set((state) => ({
      tasks: state.tasks.map((item) => (item.id === taskId ? savedTask : item)),
    }));
    await withActivity('task', 'updated', taskId, { title: savedTask.title });
    return savedTask;
  },

  deleteTask: async (taskId) => {
    const task = get().tasks.find((item) => item.id === taskId);
    await taskService.delete(taskId);
    set((state) => ({ tasks: state.tasks.filter((item) => item.id !== taskId) }));
    await withActivity('task', 'deleted', taskId, { title: task?.title || 'Task' });
  },

  archiveTask: async (taskId) => {
    const task = get().tasks.find((item) => item.id === taskId);
    if (!task) return null;
    const saved = await get().updateTask(taskId, { status: 'archived', archivedAt: new Date().toISOString() });
    await withActivity('task', 'archived', taskId, { title: task.title });
    return saved;
  },

  restoreTask: async (taskId) => {
    const task = get().tasks.find((item) => item.id === taskId);
    if (!task) return null;
    const saved = await get().updateTask(taskId, { status: 'planned', archivedAt: null });
    await withActivity('task', 'restored', taskId, { title: task.title });
    return saved;
  },

  duplicateTask: async (taskId) => {
    const task = get().tasks.find((item) => item.id === taskId);
    if (!task) return null;

    const cloneInput = {
      ...task,
      title: `${task.title} (Copy)`,
      status: task.status === 'archived' ? 'planned' : task.status,
      progress: task.status === 'completed' ? 0 : task.progress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    delete cloneInput.id;
    const savedTask = await get().createTask(cloneInput);
    await withActivity('task', 'duplicated', savedTask.id, { sourceTaskId: taskId, title: savedTask.title });
    return savedTask;
  },

  markTaskComplete: async (taskId) => {
    const task = get().tasks.find((item) => item.id === taskId);
    if (!task) return null;
    const saved = await get().updateTask(taskId, { status: 'completed', progress: 100, completedAt: new Date().toISOString() });
    await withActivity('task', 'completed', taskId, { title: task.title });
    return saved;
  },

  changeTaskStatus: async (taskId, status) => {
    const normalizedStatus = normalizeStatus(status);
    const updates = normalizedStatus === 'completed'
      ? { status: normalizedStatus, progress: 100 }
      : { status: normalizedStatus, completedAt: null };
    return get().updateTask(taskId, updates);
  },

  updateTaskProgress: async (taskId, progress) => {
    const next = Math.max(0, Math.min(100, Number(progress) || 0));
    if (next >= 100) {
      return get().markTaskComplete(taskId);
    }
    return get().updateTask(taskId, { progress: next });
  },

  addTask: async (taskData) => get().createTask(taskData),
  toggleTaskCompletion: async (taskId) => {
    const task = get().tasks.find((item) => item.id === taskId);
    if (!task) return;
    if (task.status === 'completed') {
      await get().changeTaskStatus(taskId, 'active');
      return;
    }
    await get().markTaskComplete(taskId);
  },
}));
