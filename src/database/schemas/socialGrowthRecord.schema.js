export const socialGrowthRecordSchema = {
  entity: 'socialGrowthRecords',
  fields: {
    id: 'string',
    title: 'string',
    reflection: 'string',
    confidenceRating: 'number', // 1-5
    outcome: 'string',
    tags: 'array',
    linkedGoalIds: 'array',
    linkedTaskIds: 'array',
    createdAt: 'date',
    updatedAt: 'date',
  },
  defaults: {
    title: 'Untitled Social Record',
    reflection: '',
    confidenceRating: 3,
    outcome: '',
    tags: [],
    linkedGoalIds: [],
    linkedTaskIds: [],
    createdAt: null,
    updatedAt: null,
  },
};