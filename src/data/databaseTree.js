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
  'personal',
  'trash',
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

  // Special handling for Finance to group by Accounts and Transactions
  if (path === 'finance' && data) {
    const transactions = data.transactions || [];
    const accounts = [...new Set(transactions.map(t => t.account || 'cash'))];
    
    node.type = 'folder';
    node.children = [
      {
        id: 'finance.accounts-group',
        label: 'Accounts',
        type: 'folder',
        checked: true,
        expanded: false,
        children: accounts.map(acc => {
          const accTransactions = transactions.filter(t => (t.account || 'cash') === acc);
          const balance = accTransactions.reduce((sum, t) => sum + (t.type === 'credit' ? (Number(t.amount) || 0) : -(Number(t.amount) || 0)), 0);
          return {
            id: `finance.accounts.${acc}`,
            label: `${toLabel(acc)} (₹${balance.toLocaleString()})`,
            type: 'folder',
            checked: true,
            expanded: false,
            children: accTransactions.map(t => {
              const tNode = buildNode(t, `finance.transactions.${t.id}`, depth + 2);
              tNode.id = `finance.accounts.${acc}.txn.${t.id}`; // Ensure unique ID for this view
              tNode.label = `${t.type === 'credit' ? '+' : '-'} ₹${(t.amount || 0).toLocaleString()} - ${t.title || t.category}`;
              return tNode;
            })
          };
        })
      },
      {
        id: 'finance.transactions-group',
        label: 'All Transactions',
        type: 'folder',
        checked: true,
        expanded: false,
        children: transactions.map(t => {
          const tNode = buildNode(t, `finance.transactions.${t.id}`, depth + 2);
          tNode.label = `${t.type === 'credit' ? '+' : '-'} ₹${(t.amount || 0).toLocaleString()} - ${t.title || t.category}`;
          return tNode;
        })
      }
    ];
    return node;
  }

  // Special handling for Tasks to group by Repetitive and Operational
  if (path === 'tasks' && data) {
    const tasks = Array.isArray(data) ? data : (data.tasks || []);
    const repetitiveTasks = data.repetitiveTasks || [];
    const repetitiveHistory = data.repetitiveHistory || [];

    node.type = 'folder';
    node.children = [
      {
        id: 'tasks.operational',
        label: 'Operational Tasks',
        type: 'folder',
        checked: true,
        expanded: false,
        children: ['today', 'week', 'month', 'undefined', 'completed'].map(bucket => ({
          id: `tasks.operational.${bucket}`,
          label: bucket.charAt(0).toUpperCase() + bucket.slice(1),
          type: 'folder',
          checked: true,
          expanded: false,
          children: tasks.filter(t => t.bucket === bucket).map(t => {
             const tNode = buildNode(t, `tasks.operational.${bucket}.${t.id}`, depth + 2);
             tNode.label = t.title;
             return tNode;
          })
        }))
      },
      {
        id: 'tasks.repetitive-group',
        label: 'Repeatative Tasks',
        type: 'folder',
        checked: true,
        expanded: false,
        children: [
          {
            id: 'tasks.repetitive.active',
            label: 'Active Routines',
            type: 'folder',
            checked: true,
            expanded: false,
            children: repetitiveTasks.filter(t => !t.archived).map(t => {
               const tNode = buildNode(t, `tasks.repetitive.active.${t.id}`, depth + 3);
               tNode.label = `${t.title} (Streak: ${t.streak})`;
               return tNode;
            })
          },
          {
            id: 'tasks.repetitive.history',
            label: 'Completion History',
            type: 'folder',
            checked: true,
            expanded: false,
            children: repetitiveHistory.map(day => ({
              id: `tasks.repetitive.history.${day.id}`,
              label: day.date,
              type: 'folder',
              checked: true,
              expanded: false,
              children: [
                {
                  id: `tasks.repetitive.history.${day.id}.completed`,
                  label: `Completed (${day.completedIds.length})`,
                  type: 'folder',
                  children: day.completedIds.map(id => {
                    const t = day.snapshot.find(x => x.id === id);
                    return { id: `tasks.repetitive.history.${day.id}.completed.${id}`, label: t?.title || 'Unknown', type: 'leaf' };
                  })
                },
                {
                  id: `tasks.repetitive.history.${day.id}.missed`,
                  label: `Missed (${day.missedIds.length})`,
                  type: 'folder',
                  children: day.missedIds.map(id => {
                    const t = day.snapshot.find(x => x.id === id);
                    return { id: `tasks.repetitive.history.${day.id}.missed.${id}`, label: t?.title || 'Unknown', type: 'leaf' };
                  })
                }
              ]
            }))
          }
        ]
      }
    ];
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

  // Special handling for Trash to group by original entity type
  if (path === 'trash' && Array.isArray(data)) {
    const types = [...new Set(data.map(item => item.entityType))];
    node.type = 'folder';
    node.children = types.map(type => ({
      id: `trash.${type}`,
      label: toLabel(type),
      type: 'folder',
      checked: true,
      expanded: false,
      children: data.filter(item => item.entityType === type).map(item => {
        const itemNode = buildNode(item.data, `trash.${type}.${item.id}`, depth + 2);
        itemNode.label = item.entityTitle || item.id;
        itemNode.metadata = { 
          deletedAt: item.deletedAt, 
          trashId: item.id,
          originalStore: item.entityType
        };
        return itemNode;
      })
    }));
    return node;
  }

  // Special handling for Goals to show hierarchical tree (area → goal → objective → sub_goal)
  if (path === 'goals' && Array.isArray(data)) {
    const allGoals = data;
    const rootGoals = allGoals.filter(g => g.parentId === null);

    node.type = 'folder';
    node.children = rootGoals.map(goal => buildGoalTreeNode(goal, allGoals, `goals.${goal.id}`));
    return node;
  }

  // Special handling for Personal module to group by sub-systems
  if (path === 'personal' && data) {
    node.type = 'folder';
    const categories = [
      { key: 'selfCare', label: 'Self Care' },
      { key: 'communication', label: 'Communication' },
      { key: 'socialGrowth', label: 'Social Growth' },
      { key: 'publicPersona', label: 'Public Persona' },
      { key: 'music', label: 'Singing & Music' },
      { key: 'writing', label: 'Writing & Creativity' },
      { key: 'reading', label: 'Reading & Learning' },
      { key: 'vault', label: 'Creative Vault' },
    ];

    node.children = categories.map(cat => {
      const subData = data[cat.key] || [];
      const subNode = buildNode(subData, `personal.${cat.key}`, depth + 1);
      subNode.label = cat.label;
      subNode.type = 'folder';
      return subNode;
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
