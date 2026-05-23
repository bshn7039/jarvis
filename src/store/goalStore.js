import { create } from 'zustand';
import { goalService } from '../database/services/goalService';
import { deepClone } from '../utils/deepClone';
import { useActivityStore } from './activityStore';
import { useTaskStore } from './taskStore';

const initialState = {
  goals: [],
  selectedGoalId: null,
  expandedNodeIds: {},
  isHydrated: false,
};

export const useGoalStore = create((set, get) => ({
  ...deepClone(initialState),

  hydrate: async () => {
    try {
      const goals = await goalService.getAll();
      set({ 
        goals, 
        selectedGoalId: goals.find(g => g.type === 'area')?.id ?? null,
        isHydrated: true 
      });
    } catch (err) {
      console.error('Failed to hydrate goals:', err);
    }
  },

  setSelectedGoalId: (goalId) => set({ selectedGoalId: goalId }),

  toggleNodeExpanded: (nodeId) =>
    set((state) => ({
      expandedNodeIds: {
        ...state.expandedNodeIds,
        [nodeId]: !state.expandedNodeIds[nodeId],
      },
    })),

  logActivity: async ({ action, entityId, metadata = {} }) => {
    const activityStore = useActivityStore.getState();
    await activityStore.logActivity({
      type: 'goal',
      action,
      entityType: 'goal',
      entityId,
      metadata
    });
  },

  calculateNodeProgress: (nodeId, allGoals, allTasks) => {
    const node = allGoals.find(g => g.id === nodeId);
    if (!node) return 0;
    if (node.completed) return 100;

    const children = allGoals.filter(g => g.parentId === nodeId);
    // Find tasks that link to this goal ID
    const linkedTasks = allTasks.filter(t => (t.linkedGoalIds || []).includes(nodeId));

    // If no children and no tasks, return manual progress or 0
    if (children.length === 0 && linkedTasks.length === 0) {
      return node.progress || 0;
    }

    // Combine child goals and tasks as weighted contributors
    const childProgresses = children.map(child => get().calculateNodeProgress(child.id, allGoals, allTasks));
    const taskProgresses = linkedTasks.map(task => task.progress || 0);

    const allContributors = [...childProgresses, ...taskProgresses];
    const total = allContributors.reduce((acc, p) => acc + p, 0);
    
    return Math.round(total / allContributors.length);
  },

  addGoal: async (goalData) => {
    const newGoal = {
      parentId: goalData.parentId || null,
      type: goalData.type || 'goal',
      title: goalData.title || 'New Node',
      description: goalData.description || '',
      progress: 0,
      completed: false,
      linkedTaskIds: [],
      ...goalData
    };
    const savedGoal = await goalService.create(newGoal);
    set(state => ({ goals: [...state.goals, savedGoal] }));
    await get().logActivity({ 
      action: 'created', 
      entityId: savedGoal.id,
      metadata: { title: savedGoal.title, type: savedGoal.type }
    });
    return savedGoal;
  },

  updateGoal: async (goalId, updates) => {
    const goals = get().goals;
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedGoal = { ...goal, ...updates, updatedAt: new Date() };
    await goalService.update(goalId, updatedGoal);
    set({ goals: goals.map(g => g.id === goalId ? updatedGoal : g) });
  },

  deleteGoal: async (goalId) => {
    const goals = get().goals;
    const toDelete = [goalId];
    
    const findDescendants = (parentId) => {
      goals.filter(g => g.parentId === parentId).forEach(child => {
        toDelete.push(child.id);
        findDescendants(child.id);
      });
    };
    findDescendants(goalId);

    await Promise.all(toDelete.map(id => goalService.delete(id)));
    
    set(state => ({ 
      goals: state.goals.filter(g => !toDelete.includes(g.id)),
      selectedGoalId: toDelete.includes(state.selectedGoalId) ? null : state.selectedGoalId
    }));

    await get().logActivity({ 
      action: 'deleted_recursive', 
      entityId: goalId,
      metadata: { count: toDelete.length }
    });
  }
}));
