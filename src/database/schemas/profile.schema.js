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
      semester: "string",
      courseName: "string",
      percentage: "number",
      targetPercentage: "number",
      extraInfo: "string"
    },
    degree: {
      collegeName: "string",
      degreeName: "string",
      semester: "string",
      specialization: "string",
      cgpa: "number",
      targetCgpa: "number",
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
      fullName: "baka",
      displayName: "Bhu",
      email: "baka@gmail.com",
      phone: "bakaxxxxxx",
      location: "Bengaluru, India",
      timezone: "IST"
    },
    physical: {
      heightCm: 175,
      weightKg: 72
    },
    diploma: {
      collegeName: "",
      semester: "",
      courseName: "",
      percentage: 0,
      targetPercentage: 0,
      extraInfo: ""
    },
    degree: {
      collegeName: "",
      degreeName: "",
      semester: "",
      specialization: "",
      cgpa: 0,
      targetCgpa: 0,
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
    personalityProfiles: [
      { title: "Architect", description: "Analytical and strategic thinker.", tags: ["Logical", "Planner"] }
    ]
  }
};
