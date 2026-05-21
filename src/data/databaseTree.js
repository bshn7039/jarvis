import { mockDatabase } from './mockDatabase';

const MODULE_KEYS = [
  'tasks',
  'goals',
  'journal',
  'finance',
  'fitness',
  'crm',
  'academics',
  'personal',
];

function toLabel(key) {
  return String(key)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

/**
 * Recursively builds a database tree from a data object.
 * @param {any} data - The data to traverse.
 * @param {string} path - The current path (ID).
 * @param {number} depth - Current recursion depth.
 * @returns {object} Tree node.
 */
function buildNode(data, path, depth = 0) {
  const label = path.split('.').pop() || 'Root';
  const node = {
    id: path,
    label: toLabel(label),
    checked: true,
    expanded: false,
  };

  if (Array.isArray(data)) {
    node.type = 'data';
    node.dataKey = path;
    // We also want to allow exploring arrays recursively if they contain objects
    if (data.length > 0 && typeof data[0] === 'object') {
      node.children = data.map((item, index) => {
        const itemId = item.id || item.name || index;
        return buildNode(item, `${path}.${itemId}`, depth + 1);
      });
    }
    return node;
  }

  if (data && typeof data === 'object') {
    const keys = Object.keys(data).filter(k => !['id', 'dataKey'].includes(k));
    
    // If it's a module root or has many keys, treat as folder
    if (depth === 0 || keys.length > 0) {
      node.type = depth === 0 ? 'folder' : 'folder';
      if (depth === 0) node.isModule = true;
      
      node.children = keys.map(key => buildNode(data[key], `${path}.${key}`, depth + 1));
      return node;
    }
  }

  // Primitive value
  node.type = 'data';
  node.dataKey = path;
  return node;
}

export const databaseTree = MODULE_KEYS.map(key => buildNode(mockDatabase[key], key, 0));

export function findNodeInTree(tree, nodeId) {
  if (!tree) return null;
  const nodes = Array.isArray(tree) ? tree : Object.values(tree);
  for (const node of nodes) {
    if (node.id === nodeId) return node;
    if (node.children) {
      const found = findNodeInTree(node.children, nodeId);
      if (found) return found;
    }
  }
  return null;
}

function setSubtreeChecked(node, checked) {
  const children = node.children
    ? node.children.map((child) => setSubtreeChecked(child, checked))
    : node.children;
  return { ...node, checked, children };
}

export function setNodeCheckedInTree(tree, nodeId, checked) {
  return tree.map((node) => {
    if (node.id === nodeId) {
      return setSubtreeChecked(node, checked);
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
