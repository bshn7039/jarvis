export const trashSchema = {
  entity: 'trash',
  fields: {
    id: 'string',
    entityId: 'string',
    entityType: 'string',
    entityTitle: 'string',
    actionType: 'string', // created | modified | deleted | restored
    version: 'number',
    snapshotTimestamp: 'date',
    createdAt: 'date',
    modifiedAt: 'date',
    deletedAt: 'date',
    originalPath: 'string',
    metadata: 'object',
    data: 'object',
  },
  defaults: {
    version: 1,
    metadata: {},
    data: {},
  },
};
