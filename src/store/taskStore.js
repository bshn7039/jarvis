import { create } from 'zustand';
import { taskService } from '../database/services/taskService';
import { deepClone } from '../utils/deepClone';
import { useActivityStore } from './activityStore';

const initialState = {
  tasks: [],
  searchQuery: '',
  activeCategory: 'All',
  activePriority: 'All',
  collapsedSections: {
    Today: false,
    Weekly: false,
    Monthly: false,
    Someday: false,
    Completed: false,
  },
  expandedTaskIds: {},
  isHydrated: false,
};

function normalizeStatus(task) {
  if (task.status === 'completed' || task.section === 'Completed') {
    return { status: 'completed', section: 'Completed', progress: 100 };
  }
  return task;
}

export const useTaskStore = create((set, get) => ({
  ...deepClone(initialState),

  hydrate: async () => {
    try {
      const tasks = await taskService.getAll();
      set({ tasks, isHydrated: true });
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

  logActivity: async ({ action, entityId, metadata = {} }) => {
    const activityStore = useActivityStore.getState();
    await activityStore.logActivity({
      type: 'task',
      action,
      entityType: 'task',
      entityId,
      metadata
    });
  },

  toggleTaskCompletion: async (taskId) => {
    const tasks = get().tasks;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    let updatedTask;
    const done = task.status !== 'completed';
    if (done) {
      updatedTask = { ...task, status: 'completed', section: 'Completed', progress: 100 };
    } else {
      updatedTask = normalizeStatus({
        ...task,
        status: 'todo',
        section: task.deadline?.slice(0, 10) === '2026-05-21' ? 'Today' : 'Weekly',
        progress: Math.min(task.progress || 0, 95),
      });
    }

    await taskService.update(taskId, updatedTask);
    set({ tasks: tasks.map(t => t.id === taskId ? updatedTask : t) });
    await get().logActivity({ 
      action: done ? 'completed' : 'reopened', 
      entityId: taskId,
      metadata: { title: task.title }
    });
  },

  updateTaskProgress: async (taskId, progress) => {
    const tasks = get().tasks;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const next = Math.max(0, Math.min(100, Number(progress) || 0));
    let updatedTask;
    if (next >= 100) {
      updatedTask = { ...task, progress: 100, status: 'completed', section: 'Completed' };
    } else {
      updatedTask = { ...task, progress: next };
    }

    await taskService.update(taskId, updatedTask);
    set({ tasks: tasks.map(t => t.id === taskId ? updatedTask : t) });
    if (next >= 100) {
      await get().logActivity({ 
        action: 'completed', 
        entityId: taskId,
        metadata: { title: task.title, progress: next }
      });
    } else {
      await get().logActivity({ 
        action: 'progress_updated', 
        entityId: taskId,
        metadata: { title: task.title, progress: next }
      });
    }
  },

  addTask: async (taskData) => {
    const newTask = {
      title: taskData.title?.trim() || 'Untitled task',
      description: taskData.description?.trim() || 'Quick capture',
      status: 'todo',
      section: 'Today',
      category: taskData.category || 'System',
      priority: taskData.priority || 'Medium',
      linkedGoal: taskData.linkedGoal || null,
      deadline: taskData.deadline || '2026-05-21T23:59:00',
      estimatedTime: taskData.estimatedTime || '30m',
      tags: taskData.tags || ['quick-capture'],
      progress: 0,
      scheduleId: null,
    };

    const savedTask = await taskService.create(newTask);
    set((state) => ({
      tasks: [savedTask, ...state.tasks],
    }));
    await get().logActivity({ 
      action: 'created', 
      entityId: savedTask.id,
      metadata: { title: savedTask.title }
    });
  },

  deleteTask: async (taskId) => {
    const tasks = get().tasks;
    const task = tasks.find(t => t.id === taskId);
    await taskService.delete(taskId);
    set((state) => ({
      tasks: state.tasks.filter(t => t.id !== taskId),
    }));
    await get().logActivity({ 
      action: 'deleted', 
      entityId: taskId,
      metadata: { title: task?.title }
    });
  }
}));

