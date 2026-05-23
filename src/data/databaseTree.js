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

  // Special handling for Goals to nest them correctly
  if (path === 'goals' && Array.isArray(data)) {
    const rootAreas = data.filter(g => !g.parentId);
    node.type = 'folder';
    node.children = rootAreas.map(area => buildGoalTreeNode(area, data, `goals.${area.id}`));
    return node;
  }

  // Special handling for Journal to group by date
  if (path === 'journal' && data?.entries) {
    const entries = data.entries;
    const dates = [...new Set(entries.map(e => e.entryDate))].sort((a, b) => b.localeCompare(a));
    
    node.type = 'folder';
    node.children = dates.map(date => {
      const [y, m, d] = date.split('-');
      const displayDate = `${parseInt(d)}-${parseInt(m)}-${y}`;
      const dayEntries = entries.filter(e => e.entryDate === date);
      return {
        id: `journal.${date}`,
        label: `Day (${displayDate})`,
        type: 'folder',
        checked: true,
        expanded: false,
        children: dayEntries.map(entry => {
          const entryNode = buildNode(entry, `journal.entries.${entry.id}`, depth + 2);
          entryNode.label = entry.title || 'Untitled Entry';
          return entryNode;
        })
      };
    });
    return node;
  }

  if (Array.isArray(data)) {
    node.type = 'data';
    node.dataKey = path;
    if (data.length > 0 && typeof data[0] === 'object') {
      node.children = data.map((item, index) => {
        const itemPathSegment = item?.id ?? index;
        const childNode = buildNode(item, `${path}.${itemPathSegment}`, depth + 1);
        
        // Smarter label selection
        let itemLabel = item?.title || item?.name || item?.label || item?.id;
        
        if (!itemLabel && item?.role && item?.content) {
          itemLabel = `${item.role}: ${item.content.slice(0, 30)}${item.content.length > 30 ? '...' : ''}`;
        } else if (!itemLabel && item?.date) {
          itemLabel = item.date;
        } else if (!itemLabel) {
          itemLabel = `Item ${index + 1}`;
        }
        
        childNode.label = String(itemLabel);
        return childNode;
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

/**
 * Helper to build recursive goal nodes for the tree
 */
function buildGoalTreeNode(goal, allGoals, path) {
  const children = allGoals.filter(g => g.parentId === goal.id);
  const node = {
    id: path,
    label: goal.title,
    checked: true,
    expanded: false,
    value: goal.progress !== undefined ? `${goal.progress}%` : undefined
  };

  if (children.length > 0) {
    node.type = 'folder';
    node.children = children.map(child => buildGoalTreeNode(child, allGoals, `${path}.${child.id}`));
  } else {
    node.type = 'data';
    node.dataKey = path;
  }

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
