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

  // Special handling for Finance to group by Accounts, Transactions, and Mutual Funds
  if (path === 'finance' && data) {
    const transactions = data.transactions || [];
    const accounts = [...new Set(transactions.map(t => t.account || 'cash'))];
    const mutualFunds = data.mutualFunds || [];
    
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
      },
      {
        id: 'finance.mutualfunds-group',
        label: 'Mutual Funds',
        type: 'folder',
        checked: true,
        expanded: false,
        children: mutualFunds.map(fund => {
          const totalInvested = (fund.purchases || []).reduce((s, p) => s + (p.amount || 0), 0);
          const totalUnits = (fund.purchases || []).reduce((s, p) => s + (p.units || 0), 0);
          return {
            id: `finance.mutualFunds.${fund.id}`,
            label: fund.schemeName,
            type: 'folder',
            checked: true,
            expanded: false,
            children: [
              {
                id: `finance.mutualFunds.${fund.id}.summary`,
                label: `Invested: ₹${totalInvested.toLocaleString('en-IN')} · ${parseFloat(totalUnits.toFixed(4))} units`,
                type: 'leaf',
                checked: true,
              },
              {
                id: `finance.mutualFunds.${fund.id}.code`,
                label: `Code: ${fund.schemeCode}`,
                type: 'leaf',
                checked: true,
              },
              {
                id: `finance.mutualFunds.${fund.id}.purchases`,
                label: `Purchases (${(fund.purchases || []).length})`,
                type: 'folder',
                checked: true,
                expanded: false,
                children: (fund.purchases || [])
                  .slice()
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map(p => ({
                    id: `finance.mutualFunds.${fund.id}.purchases.${p.id}`,
                    label: `${p.date} — ₹${(p.amount || 0).toLocaleString('en-IN')} @ NAV ₹${p.nav} (${p.units} units)`,
                    type: 'leaf',
                    checked: true,
                  }))
              }
            ]
          };
        })
      }
    ];

    if (mutualFunds.length === 0) {
      const mfGroup = node.children.find(c => c.id === 'finance.mutualfunds-group');
      if (mfGroup) {
        mfGroup.children = [{ id: 'finance.mutualFunds.empty', label: 'No funds tracked yet', type: 'leaf', checked: true }];
      }
    }

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

  // Special handling for Schedules to group by date
  if (path === 'schedules' && Array.isArray(data)) {
    const dates = [...new Set(data.map(s => s.date))].filter(Boolean).sort((a, b) => b.localeCompare(a));
    
    node.type = 'folder';
    node.children = dates.map(date => {
      let displayDate = date;
      if (date.includes('-')) {
        const parts = date.split('-');
        if (parts.length === 3) {
          const [y, m, d] = parts;
          displayDate = `${parseInt(d)}-${parseInt(m)}-${y}`;
        }
      }
      
      const daySchedules = data
        .filter(s => s.date === date)
        .sort((a, b) => (a.time || a.startTime || '').localeCompare(b.time || b.startTime || ''));
        
      return {
        id: `schedules.${date}`,
        label: `Schedule (${displayDate})`,
        type: 'folder',
        checked: true,
        expanded: false,
        children: daySchedules.map(item => {
          const itemNode = buildNode(item, `schedules.${item.id}`, depth + 2);
          itemNode.label = `[${item.time || item.startTime || '00:00'}] ${item.title || item.label || 'Activity'}`;
          return itemNode;
        })
      };
    });
    return node;
  }

  // Special handling for Fitness to group by date, then by categories (Meals, Hydration, Workouts)
  if (path === 'fitness' && data) {
    const workouts = data.workouts || [];
    const meals = data.meals || [];
    const hydrationLogs = data.hydrationLogs || [];
    
    const allDates = [...new Set([
      ...workouts.map(w => w.date),
      ...meals.map(m => m.date),
      ...hydrationLogs.map(h => h.date)
    ])].filter(Boolean).sort((a, b) => b.localeCompare(a));
    
    node.type = 'folder';
    node.children = allDates.map(date => {
      let displayDate = date;
      if (date.includes('-')) {
        const parts = date.split('-');
        if (parts.length === 3) {
          const [y, m, d] = parts;
          displayDate = `${parseInt(d)}-${parseInt(m)}-${y}`;
        }
      }
      
      const dayWorkouts = workouts.filter(w => w.date === date);
      const dayMeals = meals.filter(m => m.date === date);
      const dayHydration = hydrationLogs.filter(h => h.date === date);
      
      const dateChildren = [];
      
      if (dayWorkouts.length > 0) {
        dateChildren.push({
          id: `fitness.day.${date}.workouts`,
          label: 'Workouts',
          type: 'folder',
          checked: true,
          expanded: false,
          children: dayWorkouts.map(w => {
            const wNode = buildNode(w, `fitness.workouts.${w.id}`, depth + 3);
            wNode.label = `${w.title} (${w.duration})`;
            return wNode;
          })
        });
      }
      
      if (dayMeals.length > 0) {
        dateChildren.push({
          id: `fitness.day.${date}.meals`,
          label: 'Meals',
          type: 'folder',
          checked: true,
          expanded: false,
          children: dayMeals.map(m => {
            const mNode = buildNode(m, `fitness.meals.${m.id}`, depth + 3);
            mNode.label = `${m.meal}: ${m.title} (${m.calories} kcal)`;
            return mNode;
          })
        });
      }
      
      if (dayHydration.length > 0) {
        dateChildren.push({
          id: `fitness.day.${date}.hydration`,
          label: 'Hydration Logs',
          type: 'folder',
          checked: true,
          expanded: false,
          children: dayHydration.map(h => {
            const hNode = buildNode(h, `fitness.hydrationLogs.${h.id}`, depth + 3);
            hNode.label = `Water: ${h.amountMl}ml`;
            return hNode;
          })
        });
      }
      
      return {
        id: `fitness.day.${date}`,
        label: `Day (${displayDate})`,
        type: 'folder',
        checked: true,
        expanded: false,
        children: dateChildren
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

  // Special handling for Academics — group by semester → subjects → units → topics → subtopics
  if (path === 'academics' && data) {
    const subjects = data.subjects || [];
    const projects = data.projects || [];
    const dsaQuestions = data.dsaQuestions || [];
    const skills = data.skills || [];
    const techStack = data.techStack || [];

    // Group subjects by semester
    const semesterMap = {};
    subjects.forEach(sub => {
      const sem = sub.semester || 'Unknown';
      if (!semesterMap[sem]) semesterMap[sem] = [];
      semesterMap[sem].push(sub);
    });

    const semesters = Object.keys(semesterMap).sort();

    node.type = 'folder';
    node.children = [
      // Subjects grouped by semester
      {
        id: 'academics.subjects',
        label: `Subjects (${subjects.length})`,
        type: 'folder',
        checked: true,
        expanded: false,
        children: semesters.map(sem => ({
          id: `academics.subjects.${sem}`,
          label: sem,
          type: 'folder',
          checked: true,
          expanded: false,
          children: semesterMap[sem].map(sub => {
            const pct = sub.totalDays > 0 ? Math.round((sub.attendedDays || 0) / sub.totalDays * 100) : 0;
            const subNode = {
              id: `academics.subjects.${sem}.${sub.id}`,
              label: `${sub.name} (${pct}%)`,
              type: 'folder',
              checked: true,
              expanded: false,
              children: [
                {
                  id: `academics.subjects.${sem}.${sub.id}.attendance`,
                  label: `Attendance: ${sub.attendedDays || 0}/${sub.totalDays || 0} (${pct}%)`,
                  type: 'leaf',
                  checked: true,
                },
                {
                  id: `academics.subjects.${sem}.${sub.id}.internalMarks`,
                  label: `Internal Marks: ${sub.internalMarks || '—'}`,
                  type: 'leaf',
                  checked: true,
                },
                {
                  id: `academics.subjects.${sem}.${sub.id}.vivaPrep`,
                  label: `Viva Prep: ${sub.vivaPrep || '—'}`,
                  type: 'leaf',
                  checked: true,
                },
                {
                  id: `academics.subjects.${sem}.${sub.id}.syllabus`,
                  label: `Syllabus: ${sub.syllabus || '—'}`,
                  type: 'leaf',
                  checked: true,
                },
                {
                  id: `academics.subjects.${sem}.${sub.id}.revisionStatus`,
                  label: `Revision Status: ${sub.revisionStatus || 'Not Started'}`,
                  type: 'leaf',
                  checked: true,
                },
                ...(sub.units || []).map(unit => ({
                  id: `academics.subjects.${sem}.${sub.id}.${unit.id}`,
                  label: unit.name,
                  type: 'folder',
                  checked: true,
                  expanded: false,
                  children: (unit.topics || []).map(topic => ({
                    id: `academics.subjects.${sem}.${sub.id}.${unit.id}.${topic.id}`,
                    label: `${topic.done ? '✓ ' : ''}${topic.name}`,
                    type: topic.subtopics?.length > 0 ? 'folder' : 'leaf',
                    checked: true,
                    expanded: false,
                    children: (topic.subtopics || []).map((st, i) => ({
                      id: `academics.subjects.${sem}.${sub.id}.${unit.id}.${topic.id}.st${i}`,
                      label: st,
                      type: 'leaf',
                      checked: true,
                    })),
                  })),
                })),
              ],
            };
            return subNode;
          }),
        })),
      },
      // DSA
      {
        id: 'academics.dsa',
        label: `DSA Progress (${dsaQuestions.length} solved)`,
        type: 'folder',
        checked: true,
        expanded: false,
        children: dsaQuestions.map(q => ({
          id: `academics.dsa.${q.id}`,
          label: `${q.title} · ${q.difficulty}`,
          type: 'leaf',
          checked: true,
        })),
      },
      // Skills
      {
        id: 'academics.skills',
        label: `Language Mastery (${skills.length})`,
        type: 'folder',
        checked: true,
        expanded: false,
        children: skills.map(s => ({
          id: `academics.skills.${s.id}`,
          label: `${s.name} — ${s.progress || 0}%`,
          type: 'leaf',
          checked: true,
        })),
      },
      // Tech Stack
      {
        id: 'academics.techStack',
        label: `Tech Stack (${techStack.length})`,
        type: 'folder',
        checked: true,
        expanded: false,
        children: techStack.map(t => ({
          id: `academics.techStack.${t.id}`,
          label: `${t.name} · ${t.proficiency || t.category || ''}`,
          type: 'leaf',
          checked: true,
        })),
      },
      // Projects
      {
        id: 'academics.projects',
        label: `Projects (${projects.length})`,
        type: 'folder',
        checked: true,
        expanded: false,
        children: projects.map(p => ({
          id: `academics.projects.${p.id}`,
          label: `${p.name} · ${p.progress || 0}%`,
          type: 'leaf',
          checked: true,
        })),
      },
    ];

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
