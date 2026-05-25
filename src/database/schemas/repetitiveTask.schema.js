export const repetitiveTaskSchema = {
  entity: 'repetitiveTasks',
  fields: {
    id: 'string',
    title: 'string',
    description: 'string',
    createdAt: 'date',
    updatedAt: 'date',
    tags: 'array',
    subTags: 'array',
    linkedGoalIds: 'array',
    linkedTaskIds: 'array',
    linkedHabitIds: 'array',
    archived: 'boolean',
    active: 'boolean',
    streak: 'number',
    completionHistory: 'array', // Array of dates
    priority: 'string',
    category: 'string',
    notes: 'string',
  },
  defaults: {
    title: 'Untitled Repetitive Task',
    description: '',
    tags: [],
    subTags: [],
    linkedGoalIds: [],
    linkedTaskIds: [],
    linkedHabitIds: [],
    archived: false,
    active: true,
    streak: 0,
    completionHistory: [],
    priority: 'medium',
    category: 'Routine',
    notes: '',
  },
};

export const repetitiveHistorySchema = {
  entity: 'repetitiveHistory',
  fields: {
    id: 'string', // date string YYYY-MM-DD
    date: 'string',
    completedIds: 'array', // IDs of repetitive tasks completed that day
    missedIds: 'array',    // IDs of repetitive tasks active but missed that day
    snapshot: 'array',      // Full snapshot of active repetitive tasks that day
    createdAt: 'date',
    updatedAt: 'date',
  },
  defaults: {
    completedIds: [],
    missedIds: [],
    snapshot: [],
  }
};
