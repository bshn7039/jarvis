export const profileSchema = {
  entity: "profile",
  fields: {
    identity: {
      fullName: "string",
      displayName: "string",
      birthday: "string",
      age: "number",
      gender: "string",
      bloodGroup: "string",
      phone: "string",
      email: "string",
      location: "string",
      timezone: "string"
    },
    physical: {
      heightCm: "number",
      weightKg: "number",
      bodyFat: "number",
      bodyType: "string",
      fitnessGoal: "string",
      allergies: "array",
      healthRestrictions: "string"
    },
    diploma: {
      collegeName: "string",
      courseName: "string",
      completionStatus: "string",
      extraInfo: "string"
    },
    degree: {
      collegeName: "string",
      degreeName: "string",
      semester: "string",
      specialization: "string",
      cgpa: "number",
      targetCgpa: "number",
      entry: "string",
      durationYears: "number",
      totalSemesters: "number",
      status: "string",
      academicNotes: "string",
      transitionGoals: "string",
      placementPrepNotes: "string",
      higherStudiesNotes: "string",
      extraInfo: "string"
    },
    productivity: {
      wakeTime: "string",
      sleepTime: "string",
      taskHoursTarget: "number",
      preferredStudyMethod: "string",
      distractionTriggers: "array"
    },
    lifestyle: {
      hobbies: "array",
      languages: "array",
      favoriteMusic: "string",
      favoriteBooks: "array"
    },
    personalityProfiles: "array",
    system: {
      createdAt: "string",
      updatedAt: "string"
    }
  },
  defaults: {
    id: "root-profile",
    identity: {
      fullName: "",
      displayName: "",
      email: "",
      phone: "",
      location: "",
      timezone: "IST"
    },
    physical: {
      heightCm: 0,
      weightKg: 0
    },
    diploma: {
      collegeName: "Government Polytechnic",
      courseName: "Computer Engineering",
      completionStatus: "Completed",
      extraInfo: "Diploma Completed Successfully"
    },
    degree: {
      collegeName: "Pillai College",
      degreeName: "B.Tech Computer Engineering",
      semester: "Sem 1",
      specialization: "",
      cgpa: 0,
      targetCgpa: 10,
      entry: "Direct Second Year",
      durationYears: 3,
      totalSemesters: 6,
      status: "Active",
      academicGoal: "Adapt to degree-level workload",
      academicNotes: "",
      transitionGoals: "",
      placementPrepNotes: "",
      higherStudiesNotes: "",
      extraInfo: ""
    },
    productivity: {
      taskHoursTarget: 4,
      preferredStudyMethod: "Feynman Technique"
    },
    lifestyle: {
      hobbies: ["Coding", "Fitness"],
      languages: [
        { language: "English", level: "C1" },
        { language: "Japanese", level: "A1" }
      ]
    },
    personalityProfiles: []
  }
};
