export const taskSchema = {
  entity: "tasks",
  fields: {
    id: "string",
    title: "string",
    description: "string",
    status: "string",
    section: "string",
    category: "string",
    priority: "string",
    linkedGoalIds: "array",
    linkedScheduleIds: "array",
    linkedSubjectIds: "array",
    linkedHabitIds: "array",
    deadline: "date",
    estimatedTime: "string",
    tags: "array",
    progress: "number",
    scheduleId: "string",
    createdAt: "date",
    updatedAt: "date"
  },
  defaults: {
    title: "Untitled Task",
    status: "todo",
    priority: "Medium",
    progress: 0,
    tags: [],
    linkedGoalIds: [],
    linkedScheduleIds: [],
    linkedSubjectIds: [],
    linkedHabitIds: []
  }
};
