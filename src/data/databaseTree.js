const MODULE_KEYS = [
  'profile',
  'tasks',
  'goals',
  'journal',
  'finance',
  'fitness',
  'crm',
  'academics',
  'schedules',
  'chats',
];

function toLabel(key) {
  return String(key)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

/**
 * Recursively builds a database tree from a data object.
 */
export function buildNode(data, path, depth = 0) {
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
    
    if (depth === 0 || keys.length > 0) {
      node.type = depth === 0 ? 'folder' : 'folder';
      if (depth === 0) node.isModule = true;
      
      node.children = keys.map(key => buildNode(data[key], `${path}.${key}`, depth + 1));
      return node;
    }
  }

  node.type = 'data';
  node.dataKey = path;
  return node;
}

export function generateDatabaseTree(combinedState) {
  if (!combinedState) return [];
  return MODULE_KEYS.map(key => {
    const data = combinedState[key];
    if (data === undefined) return null;
    return buildNode(data, key, 0);
  }).filter(Boolean);
}

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
