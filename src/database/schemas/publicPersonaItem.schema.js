export const publicPersonaItemSchema = {
  entity: 'publicPersonaItems',
  fields: {
    id: 'string',
    platform: 'string', // e.g., 'LinkedIn', 'Instagram', 'Portfolio'
    objective: 'string',
    status: 'string', // e.g., 'draft', 'inProgress', 'completed', 'onHold'
    notes: 'string',
    links: 'array',
    linkedGoalIds: 'array',
    linkedTaskIds: 'array',
    createdAt: 'date',
    updatedAt: 'date',
  },
  defaults: {
    title: 'Untitled Public Persona Item',
    platform: 'Other',
    objective: '',
    status: 'draft',
    notes: '',
    links: [],
    linkedGoalIds: [],
    linkedTaskIds: [],
    createdAt: null,
    updatedAt: null,
  },
};