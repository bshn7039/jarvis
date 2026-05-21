export const taskSchema = {
  entity: "tasks",
  fields: {
    id: "string",
    title: "string",
    description: "string",
    status: "string", // todo, completed
    section: "string", // Today, Weekly, Monthly, Someday, Completed
    category: "string",
    priority: "string", // Critical, High, Medium, Low
    linkedGoal: "string", // ID reference
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
    tags: []
  }
};
