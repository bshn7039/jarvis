export const readingItemSchema = {
  entity: 'readingItems',
  fields: {
    id: 'string',
    title: 'string',
    author: 'string',
    status: 'string', // e.g., 'reading', 'completed', 'onHold', 'toRead'
    progress: 'number', // 0-100 (percentage or pages read)
    rating: 'number', // 1-5
    summary: 'string',
    notes: 'string',
    linkedGoalIds: 'array',
    linkedTaskIds: 'array',
    startedAt: 'date',
    completedAt: 'date',
    readingHistory: 'array', // For streak/pages tracking
    streak: 'number',
    createdAt: 'date',
    updatedAt: 'date',
  },
  defaults: {
    title: 'Untitled Book',
    author: '',
    status: 'toRead',
    progress: 0,
    rating: 0,
    summary: '',
    notes: '',
    linkedGoalIds: [],
    linkedTaskIds: [],
    startedAt: null,
    completedAt: null,
    readingHistory: [],
    streak: 0,
    createdAt: null,
    updatedAt: null,
  },
};