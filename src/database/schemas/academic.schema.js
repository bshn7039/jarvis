export const academicSchema = {
  entity: "academicSubjects",
  fields: {
    id: "string",
    code: "string",
    name: "string",
    credits: "number",
    status: "string",
    grade: "string",
    linkedAssignmentIds: "array",
    createdAt: "date",
    updatedAt: "date"
  },
  defaults: {
    status: "Ongoing",
    linkedAssignmentIds: []
  }
};
