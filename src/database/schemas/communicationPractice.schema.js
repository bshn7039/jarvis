export const communicationPracticeSchema = {
  entity: 'communicationPractices',
  fields: {
    id: 'string',
    title: 'string',
    type: 'string', // e.g., 'speaking', 'articulation', 'voiceTraining', 'breathing'
    duration: 'number', // in minutes
    notes: 'string',
    difficulty: 'string', // e.g., 'easy', 'medium', 'hard'
    progress: 'number', // 0-100
    linkedGoalIds: 'array',
    linkedTaskIds: 'array',
    practiceHistory: 'array', // For consistency tracking
    streak: 'number',
    createdAt: 'date',
    updatedAt: 'date',
  },
  defaults: {
    title: 'Untitled Practice',
    type: 'speaking',
    duration: 0,
    notes: '',
    difficulty: 'medium',
    progress: 0,
    linkedGoalIds: [],
    linkedTaskIds: [],
    practiceHistory: [],
    streak: 0,
    createdAt: null,
    updatedAt: null,
  },
};