export const chatSchema = {
  entity: "chat",
  fields: {
    id: "string",
    title: "string",
    createdAt: "string",
    updatedAt: "string",
    pinned: "boolean",
    archived: "boolean",
    messages: [
      {
        id: "string",
        role: "string", // "user" | "assistant"
        content: "string",
        createdAt: "string"
      }
    ]
  }
};
