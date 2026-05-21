import { mockDatabase } from '../data/mockDatabase';
import { createPersistedStore } from './persistHelpers';

const initialState = {
  goals: mockDatabase.goals,
  selectedGoalId: mockDatabase.goals[0]?.id ?? null,
  expandedObjectives: {},
  expandedMilestones: {},
  collapsedGoalIds: {},
};

export const useGoalStore = createPersistedStore({
  name: 'jarvis-goals',
  initialState,
  partialize: (state) => ({
    goals: state.goals,
    selectedGoalId: state.selectedGoalId,
    expandedObjectives: state.expandedObjectives,
    expandedMilestones: state.expandedMilestones,
    collapsedGoalIds: state.collapsedGoalIds,
  }),
  actions: (set) => ({
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
    updateGoalProgress: (goalId, progress) =>
      set((state) => ({
        goals: state.goals.map((goal) =>
          goal.id === goalId
            ? { ...goal, progress: Math.max(0, Math.min(100, Number(progress) || 0)) }
            : goal,
        ),
      })),
  }),
});
