<<<<<<< ours
export const MODULE_IDS = ['personal', 'academics', 'fitness', 'journal'];

export const WORKSPACE_SIZE = {
  width: 5000,
  height: 4000,
};

export const initialDatabaseTree = [
  {
    id: 'personal',
    label: 'Personal Profile',
    checked: true,
    expanded: true,
    isModule: true,
    children: [
      { id: 'personal-fullName', label: 'fullName', checked: true },
      { id: 'personal-age', label: 'age', checked: true },
      { id: 'personal-birthday', label: 'birthday', checked: true },
      { id: 'personal-heightCm', label: 'heightCm', checked: true },
      { id: 'personal-weightKg', label: 'weightKg', checked: true },
      { id: 'personal-bodyType', label: 'bodyType', checked: true },
    ],
  },
  {
    id: 'academics',
    label: 'Academics',
    checked: true,
    expanded: true,
    isModule: true,
    children: [
      {
        id: 'education',
        label: 'Current Education',
        checked: true,
        expanded: true,
        children: [
          { id: 'edu-semester', label: 'semester', checked: true },
          { id: 'edu-subjects', label: 'subjects[]', checked: true },
          { id: 'edu-assignments', label: 'assignments[]', checked: true },
        ],
      },
      {
        id: 'skills',
        label: 'Skills In Progress',
        checked: true,
        expanded: false,
        children: [
          { id: 'skills-react', label: 'React', checked: true },
          { id: 'skills-firebase', label: 'Firebase', checked: true },
          { id: 'skills-dsa', label: 'DSA', checked: true },
        ],
      },
      { id: 'revision', label: 'Revision Deck', checked: true },
      { id: 'academics-dsa', label: 'dsaProgress', checked: true },
      { id: 'academics-project', label: 'currentProject', checked: true },
    ],
  },
  {
    id: 'fitness',
    label: 'Fitness',
    checked: true,
    expanded: false,
    isModule: true,
    children: [
      { id: 'fitness-protein', label: 'proteinTarget', checked: true },
      { id: 'fitness-split', label: 'workoutSplit', checked: true },
      { id: 'fitness-sessions', label: 'weeklySessions', checked: true },
      { id: 'fitness-last', label: 'lastWorkout', checked: true },
    ],
  },
  {
    id: 'trading',
    label: 'Trading',
    checked: false,
    expanded: false,
    isModule: true,
    children: [
      { id: 'trading-portfolio', label: 'portfolio', checked: false },
      { id: 'trading-watchlist', label: 'watchlist', checked: false },
      { id: 'trading-positions', label: 'openPositions', checked: false },
    ],
  },
  {
    id: 'journal',
    label: 'Journal',
    checked: true,
    expanded: false,
    isModule: true,
    children: [
      { id: 'journal-mood', label: 'moodScore', checked: true },
      { id: 'journal-reflection', label: 'reflection', checked: true },
      { id: 'journal-date', label: 'entryDate', checked: true },
      { id: 'journal-streak', label: 'streak', checked: true },
    ],
  },
];
=======
import { canvasModules } from '../config/canvasModules';

export const MODULE_IDS = canvasModules.map((module) => module.id);

export const initialDatabaseTree = canvasModules.map((module) => ({
  id: module.id,
  label: module.title,
  checked: module.visible,
  expanded: false,
  isModule: true,
  children: [],
}));
>>>>>>> theirs

export function findNodeInTree(tree, nodeId) {
  for (const node of tree) {
    if (node.id === nodeId) return node;
    if (node.children) {
      const found = findNodeInTree(node.children, nodeId);
      if (found) return found;
    }
  }
  return null;
}

export function setNodeCheckedInTree(tree, nodeId, checked) {
  return tree.map((node) => {
    if (node.id === nodeId) {
      return { ...node, checked };
    }
    if (node.children) {
      return { ...node, children: setNodeCheckedInTree(node.children, nodeId, checked) };
    }
    return node;
  });
}

export function toggleTreeExpanded(tree, nodeId) {
  return tree.map((node) => {
    if (node.id === nodeId) {
      return { ...node, expanded: !node.expanded };
    }
    if (node.children) {
      return { ...node, children: toggleTreeExpanded(node.children, nodeId) };
    }
    return node;
  });
}
