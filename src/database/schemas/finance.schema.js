export const financeSchema = {
  entity: "financeTransactions",
  fields: {
    id: "string",
    type: "string", // "credit" | "debit"
    amount: "number",
    title: "string",
    description: "string",
    category: "string",
    account: "string",
    createdAt: "date",
    transactionDate: "date",
    linkedTaskId: "string",
    tags: "array",
    archived: "boolean",
    metadata: "object",
    updatedAt: "date"
  },
  defaults: {
    type: "debit",
    amount: 0,
    category: "Miscellaneous",
    account: "cash",
    archived: false,
    tags: [],
    metadata: {}
  }
};
