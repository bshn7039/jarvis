export const creativeVaultIdeaSchema = {
  entity: 'creativeVaultIdeas',
  fields: {
    id: 'string',
    title: 'string',
    content: 'string',
    category: 'string', // e.g., 'inspiration', 'futureProject', 'concept', 'experiment', 'random'
    tags: 'array',
    priority: 'string', // e.g., 'low', 'medium', 'high', 'critical'
    pinned: 'boolean',
    linkedGoalIds: 'array',
    linkedTaskIds: 'array',
    createdAt: 'date',
    updatedAt: 'date',
  },
  defaults: {
    title: 'Untitled Idea',
    content: '',
    category: 'random',
    tags: [],
    priority: 'medium',
    pinned: false,
    linkedGoalIds: [],
    linkedTaskIds: [],
    createdAt: null,
    updatedAt: null,
  },
};