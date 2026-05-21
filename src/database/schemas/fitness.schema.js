export const fitnessSchema = {
  entity: "fitnessLogs",
  fields: {
    id: "string",
    date: "string",
    type: "string", // workout, meal, hydration, bodyMetric
    // Workout specific
    title: "string",
    completed: "boolean",
    // Meal specific
    meal: "string", // Breakfast, Lunch, etc.
    calories: "number",
    protein: "number",
    // Hydration specific
    amountMl: "number",
    // BodyMetric specific
    weight: "number",
    bodyFat: "number",
    
    createdAt: "date",
    updatedAt: "date"
  },
  defaults: {
    completed: false,
    calories: 0,
    protein: 0,
    amountMl: 0
  }
};
