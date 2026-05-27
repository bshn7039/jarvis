/**
 * initialSeed.js
 * 
 * Comprehensive starter data for JARVIS Life Direction Architecture.
 */

const mockDatabase = {
  canvasRegistry: [
    { id: 'profile', title: 'Profile', route: '/profile', dataKey: 'profile' },
    { id: 'tasks', title: 'Tasks', route: '/tasks', dataKey: 'tasks' },
    { id: 'goals', title: 'Goals', route: '/goals', dataKey: 'goals' },
    { id: 'journal', title: 'Journal', route: '/journal', dataKey: 'journal' },
    { id: 'finance', title: 'Finance', route: '/finance', dataKey: 'finance' },
    { id: 'fitness', title: 'Fitness', route: '/fitness', dataKey: 'fitness' },
    { id: 'crm', title: 'CRM', route: '/crm', dataKey: 'crm' },
    { id: 'academics', title: 'Academics', route: '/academics', dataKey: 'academics' },
    { id: 'schedules', title: 'Schedules', route: '/home', dataKey: 'schedules' },
  ],

  schedules: [],

  goals: [
    // 1. ACADEMICS & CAREER
    { id: 'area-1', parentId: null, type: 'area', title: 'Academics & Career', description: 'Professional and educational growth.', progress: 0, linkedTaskIds: [] },
    { id: 'goal-1-1', parentId: 'area-1', type: 'goal', title: 'Become a highly employable software engineer', description: 'Focus on technical fundamentals and portfolio.', progress: 0, linkedTaskIds: [] },
    
    { id: 'obj-1-1-1', parentId: 'goal-1-1', type: 'objective', title: 'Complete diploma with strong percentage', progress: 0, linkedTaskIds: [] },
    { id: 'obj-1-1-2', parentId: 'goal-1-1', type: 'objective', title: 'Prepare for degree/BTech transition', progress: 0, linkedTaskIds: [] },
    { id: 'obj-1-1-3', parentId: 'goal-1-1', type: 'objective', title: 'Build strong programming foundations', progress: 0, linkedTaskIds: [] },
    { id: 'obj-1-1-4', parentId: 'goal-1-1', type: 'objective', title: 'Become interview-ready', progress: 0, linkedTaskIds: [] },
    { id: 'obj-1-1-5', parentId: 'goal-1-1', type: 'objective', title: 'Build portfolio projects', progress: 0, linkedTaskIds: [] },
    { id: 'obj-1-1-6', parentId: 'goal-1-1', type: 'objective', title: 'Establish online professional presence', progress: 0, linkedTaskIds: [] },

    { id: 'sub-1-1-3-1', parentId: 'obj-1-1-3', type: 'sub_goal', title: 'Improve DSA problem solving', progress: 0, linkedTaskIds: [] },
    { id: 'sub-1-1-3-2', parentId: 'obj-1-1-3', type: 'sub_goal', title: 'Strengthen React fundamentals', progress: 0, linkedTaskIds: [] },
    { id: 'sub-1-1-3-3', parentId: 'obj-1-1-3', type: 'sub_goal', title: 'Learn backend fundamentals', progress: 0, linkedTaskIds: [] },
    { id: 'sub-1-1-5-1', parentId: 'obj-1-1-5', type: 'sub_goal', title: 'Build Jarvis v1', progress: 0, linkedTaskIds: [] },

    // 2. FITNESS & PHYSICAL DEVELOPMENT
    { id: 'area-2', parentId: null, type: 'area', title: 'Fitness & Physical Development', description: 'Health and body discipline.', progress: 0, linkedTaskIds: [] },
    { id: 'goal-2-1', parentId: 'area-2', type: 'goal', title: 'Build a healthier, stronger body', description: 'Consistent routine and nutrition.', progress: 0, linkedTaskIds: [] },

    { id: 'obj-2-1-1', parentId: 'goal-2-1', type: 'objective', title: 'Build workout consistency', progress: 0, linkedTaskIds: [] },
    { id: 'obj-2-1-2', parentId: 'goal-2-1', type: 'objective', title: 'Improve nutrition discipline', progress: 0, linkedTaskIds: [] },
    
    { id: 'sub-2-1-1-1', parentId: 'obj-2-1-1', type: 'sub_goal', title: 'Follow weekly workout routine', progress: 0, linkedTaskIds: [] },
    { id: 'sub-2-1-2-1', parentId: 'obj-2-1-2', type: 'sub_goal', title: 'Improve protein intake', progress: 0, linkedTaskIds: [] },

    // 3. COMMUNICATION & SOCIAL DEVELOPMENT
    { id: 'area-3', parentId: null, type: 'area', title: 'Communication & Social Development', description: 'Confidence and interpersonal skills.', progress: 0, linkedTaskIds: [] },
    { id: 'goal-3-1', parentId: 'area-3', type: 'goal', title: 'Improve communication and presence', description: 'Speaking and social confidence.', progress: 0, linkedTaskIds: [] },

    { id: 'obj-3-1-1', parentId: 'goal-3-1', type: 'objective', title: 'Improve speaking ability', progress: 0, linkedTaskIds: [] },
    { id: 'sub-3-1-1-1', parentId: 'obj-3-1-1', type: 'sub_goal', title: 'Practice speaking regularly', progress: 0, linkedTaskIds: [] },

    // 4. CREATIVE SKILLS & HOBBIES
    { id: 'area-4', parentId: null, type: 'area', title: 'Creative Skills & Hobbies', description: 'Artistic and creative expression.', progress: 0, linkedTaskIds: [] },
    { id: 'goal-4-1', parentId: 'area-4', type: 'goal', title: 'Develop creative expression', description: 'Music and digital creativity.', progress: 0, linkedTaskIds: [] },

    // 5. FINANCIAL GROWTH & INVESTING
    { id: 'area-5', parentId: null, type: 'area', title: 'Financial Growth & Investing', description: 'Financial discipline and market knowledge.', progress: 0, linkedTaskIds: [] },
    { id: 'goal-5-1', parentId: 'area-5', type: 'goal', title: 'Build financial discipline', description: 'Savings and investing fundamentals.', progress: 0, linkedTaskIds: [] },

    // 6. PRODUCTIVITY & DISCIPLINE
    { id: 'area-6', parentId: null, type: 'area', title: 'Productivity & Discipline', description: 'Operational consistency and execution.', progress: 0, linkedTaskIds: [] },
    { id: 'goal-6-1', parentId: 'area-6', type: 'goal', title: 'Build operational consistency', description: 'Task execution and planning.', progress: 0, linkedTaskIds: [] },

    // 7. PERSONAL EVOLUTION & LIFESTYLE
    { id: 'area-7', parentId: null, type: 'area', title: 'Personal Evolution & Lifestyle', description: 'Identity, mindset, and quality of life.', progress: 0, linkedTaskIds: [] },
    { id: 'goal-7-1', parentId: 'area-7', type: 'goal', title: 'Improve identity and mindset', description: 'Self-awareness and discipline mindset.', progress: 0, linkedTaskIds: [] },
  ],

  tasks: [],

  journal: {
    entries: [],
    streak: 0,
  },

  finance: {
    balanceOverview: {
      totalBalance: 0,
      checking: 0,
      savings: 0,
      cash: 0,
    },
    transactions: [],
    savingsGoals: [],
  },

  fitness: {
    targets: {
      calories: 2500,
      protein: 140,
      hydrationMl: 3500,
      weeklyWorkouts: 5,
    },
    workouts: [],
    meals: [],
    hydrationLogs: [],
    bodyMetrics: [],
    routines: [],
  },

  crm: {
    contacts: [],
    reminders: [],
    interactionLog: [],
  },

  academics: {
    currentSemester: 'Sem 1',
    termEndDate: '2026-12-30',
    subjects: [
      { id: 'sub-001', name: 'Data Structures', code: 'CS301', status: 'Ongoing', credits: 4, attendance: 0, revisionStatus: 'Not Started' },
      { id: 'sub-002', name: 'Computer Networks', code: 'CS302', status: 'Ongoing', credits: 4, attendance: 0, revisionStatus: 'Not Started' },
      { id: 'sub-003', name: 'Operating Systems', code: 'CS303', status: 'Ongoing', credits: 4, attendance: 0, revisionStatus: 'Not Started' },
      { id: 'sub-004', name: 'Database Management', code: 'CS304', status: 'Ongoing', credits: 4, attendance: 0, revisionStatus: 'Not Started' },
      { id: 'sub-005', name: 'Discrete Mathematics', code: 'CS305', status: 'Ongoing', credits: 4, attendance: 0, revisionStatus: 'Not Started' },
      { id: 'sub-006', name: 'Java / Python', code: 'CS306', status: 'Ongoing', credits: 3, attendance: 0, revisionStatus: 'Not Started' },
      { id: 'sub-007', name: 'Engineering Mathematics', code: 'CS307', status: 'Ongoing', credits: 4, attendance: 0, revisionStatus: 'Not Started' },
      { id: 'sub-008', name: 'Mini Project', code: 'CS308', status: 'Ongoing', credits: 2, attendance: 0, revisionStatus: 'Not Started' },
    ],
    assignments: [],
    practicals: [],
    revisionLogs: [],
    codingProgress: {
      solvedProblems: 0,
      targetProblems: 500,
      streakDays: 0,
      weeklySolved: 0,
      currentTopic: '',
      weakTopics: [],
      revisionQueue: [],
      contestHistory: [],
    },
    projects: [],
  },

  profile: {
    identity: {
      fullName: '',
      displayName: '',
      location: '',
      timezone: 'IST'
    },
    physical: {
      heightCm: 0,
      weightKg: 0
    },
    degree: {
      collegeName: '',
      degreeName: '',
      semester: '',
      cgpa: 0,
      targetCgpa: 0,
    },
    productivity: {
      deepWorkHours: 4
    },
    lifestyle: {
      hobbies: []
    }
  }
};

export const seedData = {
  tasks: mockDatabase.tasks,
  goals: mockDatabase.goals,
  journalEntries: mockDatabase.journal.entries,
  financeTransactions: mockDatabase.finance.transactions,
  fitnessLogs: [
    ...mockDatabase.fitness.workouts.map(w => ({ ...w, type: 'workout' })),
    ...mockDatabase.fitness.meals.map(m => ({ ...m, type: 'meal' })),
    ...mockDatabase.fitness.hydrationLogs.map(h => ({ ...h, type: 'hydration' })),
    ...mockDatabase.fitness.bodyMetrics.map(b => ({ ...b, type: 'bodyMetric' }))
  ],
  crmContacts: mockDatabase.crm.contacts,
  academicSubjects: mockDatabase.academics.subjects,
  academicAssignments: mockDatabase.academics.assignments,
  academicPracticals: mockDatabase.academics.practicals,
  academicRevisionLogs: mockDatabase.academics.revisionLogs,
  schedules: mockDatabase.schedules,
  metricsSnapshots: [],
  profile: [
    { id: 'root-profile', ...mockDatabase.profile }
  ],
  canvas: mockDatabase.canvasRegistry,
  chats: [],
  savingsGoals: mockDatabase.finance.savingsGoals,
  fitnessRoutines: mockDatabase.fitness.routines,
  crmReminders: mockDatabase.crm.reminders,
  crmInteractions: mockDatabase.crm.interactionLog,
  academicProjects: mockDatabase.academics.projects,
  academicMeta: [
    { id: 'semester-info', currentSemester: mockDatabase.academics.currentSemester, termEndDate: mockDatabase.academics.termEndDate },
    { id: 'coding-progress', ...mockDatabase.academics.codingProgress }
  ],
  personal: {
    profile: {
      fullName: 'Bhuvaneshwaran',
      displayName: 'Bhu',
      location: 'Panvel, India',
    },
    preferences: {
      sidebarCollapsed: false,
      canvasZoom: 1,
    }
  }
};
