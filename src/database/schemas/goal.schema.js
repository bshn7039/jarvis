export const goalSchema = {
  entity: "goals",
  fields: {
    id: "string",
    title: "string",
    lifeGoal: "string",
    mission: "string",
    currentPhase: "string",
    progress: "number",
    objectives: "array", // [{ id, label, completed }]
    milestones: "array", // [{ id, title, completed, deadline }]
    linkedTaskIds: "array",
    createdAt: "date",
    updatedAt: "date"
  },
  defaults: {
    title: "New Goal",
    progress: 0,
    objectives: [],
    milestones: [],
    linkedTaskIds: []
  }
};
