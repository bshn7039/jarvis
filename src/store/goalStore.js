import { create } from 'zustand';
import { goalService } from '../database/services/goalService';
import { deepClone } from '../utils/deepClone';
import { useActivityStore } from './activityStore';

const initialState = {
  goals: [],
  selectedGoalId: null,
  expandedObjectives: {},
  expandedMilestones: {},
  collapsedGoalIds: {},
  isHydrated: false,
};

export const useGoalStore = create((set, get) => ({
  ...deepClone(initialState),

  hydrate: async () => {
    try {
      const goals = await goalService.getAll();
      set({ 
        goals, 
        selectedGoalId: goals[0]?.id ?? null,
        isHydrated: true 
      });
    } catch (err) {
      console.error('Failed to hydrate goals:', err);
    }
  },

  setSelectedGoalId: (goalId) => set({ selectedGoalId: goalId }),

  toggleGoalCollapsed: (goalId) =>
    set((state) => ({
      collapsedGoalIds: {
        ...state.collapsedGoalIds,
        [goalId]: !state.collapsedGoalIds[goalId],
      },
    })),

  toggleObjectiveExpanded: (objectiveId) =>
    set((state) => ({
      expandedObjectives: {
        ...state.expandedObjectives,
        [objectiveId]: !state.expandedObjectives[objectiveId],
      },
    })),

  toggleMilestoneExpanded: (milestoneId) =>
    set((state) => ({
      expandedMilestones: {
        ...state.expandedMilestones,
        [milestoneId]: !state.expandedMilestones[milestoneId],
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

  updateGoalProgress: async (goalId, progress) => {
    const goals = get().goals;
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const nextProgress = Math.max(0, Math.min(100, Number(progress) || 0));
    const updatedGoal = { ...goal, progress: nextProgress };

    await goalService.update(goalId, updatedGoal);
    set({ goals: goals.map(g => g.id === goalId ? updatedGoal : g) });
    await get().logActivity({ 
      action: 'progress_updated', 
      entityId: goalId,
      metadata: { title: goal.title, progress: nextProgress }
    });
  },

  addGoal: async (goalData) => {
    const newGoal = {
      title: goalData.title || 'New Goal',
      lifeGoal: goalData.lifeGoal || '',
      mission: goalData.mission || '',
      currentPhase: goalData.currentPhase || '',
      progress: 0,
      objectives: [],
      milestones: [],
      ...goalData
    };
    const savedGoal = await goalService.create(newGoal);
    set(state => ({ goals: [...state.goals, savedGoal] }));
    await get().logActivity({ 
      action: 'created', 
      entityId: savedGoal.id,
      metadata: { title: savedGoal.title }
    });
  }
}));

