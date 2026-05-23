export const journalSchema = {
  entity: "journalEntries",
  fields: {
    id: "string",
    date: "string", // Keep for legacy/utility
    entryDate: "string", // YYYY-MM-DD (Primary for calendar)
    type: "string", // Thoughts, Reflection, Log, undefined
    title: "string",
    content: "string",
    mood: "number", // 1-10 or null
    tags: "array", // defaults to ["undefined"] if empty
    aspects: "array", // categories
    linkedTaskIds: "array",
    linkedGoalIds: "array",
    attachments: "array",
    archived: "boolean",
    favorite: "boolean",
    createdAt: "date",
    updatedAt: "date"
  },
  defaults: {
    type: "undefined",
    title: "Untitled Entry",
    mood: null,
    tags: ["undefined"],
    aspects: [],
    linkedTaskIds: [],
    linkedGoalIds: [],
    attachments: [],
    archived: false,
    favorite: false,
    content: ""
  }
};
