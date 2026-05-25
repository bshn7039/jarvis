export const crmSchema = {
  entity: "crmContacts",
  fields: {
    id: "string",
    name: "string",
    nickname: "string",
    relationshipType: "string",
    phone: "string",
    email: "string",
    socialLinks: "array",
    birthday: "date",
    location: "string",
    notes: "string",
    tags: "array",
    priority: "string",
    linkedEntityIds: "array",
    lastInteraction: "date",
    createdAt: "date",
    updatedAt: "date"
  },
  defaults: {
    name: "New Contact",
    nickname: "",
    relationshipType: "other",
    phone: "",
    email: "",
    socialLinks: [],
    birthday: "",
    location: "",
    notes: "",
    tags: [],
    priority: "medium",
    linkedEntityIds: [],
    lastInteraction: ""
  }
};
