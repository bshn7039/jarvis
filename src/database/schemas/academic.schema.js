export const academicSchema = {
  entity: "academicSubjects",
  fields: {
    id: "string",
    code: "string",
    name: "string",
    credits: "number",
    status: "string",
    syllabus: "string",
    notes: "string",
    revisionStatus: "string",
    weakTopics: "array",
    importantQuestions: "string",
    attendance: "number",
    internalMarks: "string",
    practicals: "string",
    vivaPrep: "string",
    linkedAssignmentIds: "array",
    createdAt: "date",
    updatedAt: "date"
  },
  defaults: {
    status: "Ongoing",
    revisionStatus: "Not Started",
    attendance: 0,
    linkedAssignmentIds: [],
    weakTopics: []
  }
};
