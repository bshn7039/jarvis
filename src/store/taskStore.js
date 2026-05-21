import { mockDatabase } from '../data/mockDatabase';
import { createPersistedStore } from './persistHelpers';

const initialState = {
  tasks: mockDatabase.tasks,
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
};

function normalizeStatus(task) {
  if (task.status === 'completed' || task.section === 'Completed') {
    return { status: 'completed', section: 'Completed', progress: 100 };
  }
  return task;
}

export const useTaskStore = createPersistedStore({
  name: 'jarvis-tasks',
  initialState,
  partialize: (state) => ({
    tasks: state.tasks,
    searchQuery: state.searchQuery,
    activeCategory: state.activeCategory,
    activePriority: state.activePriority,
    collapsedSections: state.collapsedSections,
    expandedTaskIds: state.expandedTaskIds,
  }),
  actions: (set) => ({
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
    toggleTaskCompletion: (taskId) =>
      set((state) => ({
        tasks: state.tasks.map((task) => {
          if (task.id !== taskId) return task;
          const done = task.status !== 'completed';
          if (done) {
            return { ...task, status: 'completed', section: 'Completed', progress: 100 };
          }
          return normalizeStatus({
            ...task,
            status: 'todo',
            section: task.deadline?.slice(0, 10) === '2026-05-21' ? 'Today' : 'Weekly',
            progress: Math.min(task.progress || 0, 95),
          });
        }),
      })),
    updateTaskProgress: (taskId, progress) =>
      set((state) => ({
        tasks: state.tasks.map((task) => {
          if (task.id !== taskId) return task;
          const next = Math.max(0, Math.min(100, Number(progress) || 0));
          if (next >= 100) {
            return { ...task, progress: 100, status: 'completed', section: 'Completed' };
          }
          return { ...task, progress: next };
        }),
      })),
    addTask: (task) =>
      set((state) => ({
        tasks: [
          {
            id: `task-local-${Date.now()}`,
            title: task.title?.trim() || 'Untitled task',
            description: task.description?.trim() || 'Quick capture',
            status: 'todo',
            section: 'Today',
            category: task.category || 'System',
            priority: task.priority || 'Medium',
            linkedGoal: task.linkedGoal || null,
            deadline: task.deadline || '2026-05-21T23:59:00',
            estimatedTime: task.estimatedTime || '30m',
            tags: task.tags || ['quick-capture'],
            progress: 0,
            scheduleId: null,
          },
          ...state.tasks,
        ],
      })),
  }),
});
