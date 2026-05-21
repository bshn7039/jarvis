export const crmSchema = {
  entity: "crmContacts",
  fields: {
    id: "string",
    name: "string",
    role: "string",
    organization: "string",
    tags: "array",
    notes: "string",
    lastInteraction: "date",
    linkedEntityIds: "array",
    createdAt: "date",
    updatedAt: "date"
  },
  defaults: {
    name: "New Contact",
    tags: [],
    linkedEntityIds: []
  }
};
