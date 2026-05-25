export const selfCareRoutineSchema = {
  entity: 'selfCareRoutines',
  fields: {
    id: 'string',
    title: 'string',
    description: 'string',
    frequency: 'string', // e.g., 'daily', 'weekly', 'monthly', 'asNeeded'
    status: 'string', // e.g., 'pending', 'completed', 'skipped'
    notes: 'string',
    tags: 'array',
    linkedGoalIds: 'array',
    linkedTaskIds: 'array',
    completionHistory: 'array', // For consistency tracking
    streak: 'number',
    createdAt: 'date',
    updatedAt: 'date',
  },
  defaults: {
    title: 'Untitled Routine',
    description: '',
    frequency: 'daily',
    status: 'pending',
    notes: '',
    tags: [],
    linkedGoalIds: [],
    linkedTaskIds: [],
    completionHistory: [],
    streak: 0,
    createdAt: null,
    updatedAt: null,
  },
};