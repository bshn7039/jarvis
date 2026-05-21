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
    academics: {
      college: "string",
      degree: "string",
      semester: "string",
      specialization: "string",
      currentSubjects: "array",
      cgpa: "number",
      targetCareer: "string"
    },
    productivity: {
      wakeTime: "string",
      sleepTime: "string",
      deepWorkHours: "number",
      preferredStudyMethod: "string",
      distractionTriggers: "array"
    },
    lifestyle: {
      hobbies: "array",
      languages: "array",
      favoriteMusic: "string",
      favoriteBooks: "array",
      personalityNotes: "string"
    },
    system: {
      createdAt: "string",
      updatedAt: "string"
    }
  },
  defaults: {
    id: "root-profile",
    identity: {
      fullName: "Bhuvaneshwaran",
      displayName: "Bhu",
      location: "Bengaluru, India",
      timezone: "IST"
    },
    physical: {
      heightCm: 175,
      weightKg: 72
    },
    academics: {
      semester: "Semester 6"
    },
    productivity: {
      deepWorkHours: 4
    },
    lifestyle: {
      hobbies: ["Coding", "Fitness"]
    }
  }
};
