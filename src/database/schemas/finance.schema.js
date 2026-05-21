export const financeSchema = {
  entity: "financeTransactions",
  fields: {
    id: "string",
    date: "string",
    type: "string", // income, expense
    category: "string",
    amount: "number",
    note: "string",
    linkedTaskId: "string",
    createdAt: "date",
    updatedAt: "date"
  },
  defaults: {
    type: "expense",
    amount: 0,
    category: "Miscellaneous"
  }
};
