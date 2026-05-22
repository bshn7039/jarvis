export const activitySchema = {
  entity: "activities",
  fields: {
    id: "string",
    type: "string", // task, goal, journal, finance, fitness, academic, crm, profile, schedule
    action: "string", // created, updated, completed, archived, deleted, progress_updated, reopened
    entityType: "string", // task, goal, journal_entry, transaction, workout, assignment, contact, profile, schedule
    entityId: "string",
    timestamp: "string", // ISO date
    metadata: "object", // flexible payload { title, amount, progress, etc. }
    createdAt: "date",
    updatedAt: "date"
  },
  defaults: {
    timestamp: () => new Date().toISOString()
  }
};
