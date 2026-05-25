export const creativeEntrySchema = {
  entity: 'creativeEntries',
  fields: {
    id: 'string',
    title: 'string',
    content: 'string',
    mood: 'string', // e.g., 'happy', 'sad', 'reflective', 'energetic'
    tags: 'array',
    type: 'string', // e.g., 'lyrics', 'poetry', 'idea', 'draft', 'inspiration'
    linkedGoalIds: 'array',
    linkedTaskIds: 'array',
    createdAt: 'date',
    updatedAt: 'date',
  },
  defaults: {
    title: 'Untitled Creative Entry',
    content: '',
    mood: 'neutral',
    tags: [],
    type: 'idea',
    linkedGoalIds: [],
    linkedTaskIds: [],
    createdAt: null,
    updatedAt: null,
  },
};