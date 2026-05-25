export const musicPracticeLogSchema = {
  entity: 'musicPracticeLogs',
  fields: {
    id: 'string',
    title: 'string',
    type: 'string', // e.g., 'Singing', 'Guitar', 'Flute', 'Music Theory', 'Exercise', 'Song'
    duration: 'number', // in minutes
    difficulty: 'string', // e.g., 'easy', 'medium', 'hard'
    progress: 'number', // 0-100
    notes: 'string',
    linkedGoalIds: 'array',
    linkedTaskIds: 'array',
    practiceHistory: 'array', // For consistency tracking
    streak: 'number',
    createdAt: 'date',
    updatedAt: 'date',
  },
  defaults: {
    title: 'Untitled Music Practice',
    type: 'Singing',
    duration: 0,
    difficulty: 'medium',
    progress: 0,
    notes: '',
    linkedGoalIds: [],
    linkedTaskIds: [],
    practiceHistory: [],
    streak: 0,
    createdAt: null,
    updatedAt: null,
  },
};