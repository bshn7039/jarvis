export const journalSchema = {
  entity: "journalEntries",
  fields: {
    id: "string",
    date: "string", // YYYY-MM-DD
    type: "string", // Thoughts, Reflection, Log
    title: "string",
    content: "string",
    mood: "number", // 1-10
    tags: "array",
    linkedTaskId: "string",
    createdAt: "date",
    updatedAt: "date"
  },
  defaults: {
    type: "Thoughts",
    title: "Quick Note",
    mood: 6,
    tags: [],
    content: ""
  }
};
