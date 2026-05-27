import { useGoalStore } from '../../../store/goalStore';

function buildGoalTree(goals, parentId = null) {
  return goals
    .filter(g => g.parentId === parentId)
    .map(g => {
      const children = buildGoalTree(goals, g.id);
      const node = {
        id: g.id,
        title: g.title,
        type: g.type,
        progress: g.progress || 0,
      };
      if (g.description) node.description = g.description;
      if (g.completed) node.completed = true;
      if (children.length > 0) node.children = children;
      return node;
    });
}

export function getGoalContext() {
  const state = useGoalStore.getState();
  const allGoals = state.goals || [];

  const activeGoals = allGoals.filter(g => !g.completed && !g.archived);
  const completedGoals = allGoals.filter(g => g.completed && !g.archived);

  const goalTree = buildGoalTree(activeGoals);

  return {
    metrics: {
      totalGoals: allGoals.length,
      active: activeGoals.length,
      completed: completedGoals.length
    },
    goalTree
  };
}

