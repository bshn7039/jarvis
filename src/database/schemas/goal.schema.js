export const goalSchema = {
  entity: "goals",
  fields: {
    id: "string",
    parentId: "string", // null for root life areas
    type: "string", // 'area', 'goal', 'objective', 'sub_goal'
    title: "string",
    description: "string",
    progress: "number",
    linkedTaskIds: "array",
    createdAt: "date",
    updatedAt: "date"
  },
  defaults: {
    parentId: null,
    type: "goal",
    title: "New Node",
    description: "",
    progress: 0,
    linkedTaskIds: []
  }
};
