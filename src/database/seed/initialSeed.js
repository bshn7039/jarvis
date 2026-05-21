/**
 * initialSeed.js
 * 
 * SMALL realistic starter data for JARVIS.
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
  ],

  schedules: [
    { id: 'sch-001', label: 'Morning Deep Work', date: '2026-05-21', time: '06:30', module: 'System', taskIds: ['task-001'] },
  ],

  goals: [
    {
      id: 'goal-1',
      title: 'Become Employable Developer',
      lifeGoal: 'Career Sovereignty',
      mission: 'Build projects and interview depth to land a strong developer role.',
      currentPhase: 'Portfolio Sprint',
      progress: 30,
      objectives: [],
      milestones: [],
    },
    {
      id: 'goal-2',
      title: 'Build Elite Discipline',
      lifeGoal: 'Operating Excellence',
      mission: 'Execute non-negotiable routines with consistency.',
      currentPhase: 'Consistency Layer',
      progress: 45,
      objectives: [],
      milestones: [],
    },
  ],

  tasks: [
    { id: 'task-001', title: 'Finalize Jarvis module routing', description: 'Wire all new module pages into router.', status: 'in_progress', section: 'Today', category: 'System', priority: 'Critical', linkedGoal: 'goal-1', deadline: '2026-05-21T23:00:00', estimatedTime: '120m', tags: ['jarvis'], progress: 70, scheduleId: 'sch-001' },
    { id: 'task-002', title: 'Read 20 pages of clean code', description: 'Focus on naming and functions.', status: 'todo', section: 'Today', category: 'Skill Building', priority: 'Medium', linkedGoal: 'goal-2', deadline: '2026-05-21T22:00:00', estimatedTime: '45m', tags: ['reading'], progress: 0, scheduleId: null },
    { id: 'task-003', title: 'Morning workout sprint', description: 'Quick 30 min session.', status: 'completed', section: 'Completed', category: 'Fitness', priority: 'High', linkedGoal: 'goal-2', deadline: '2026-05-21T08:30:00', estimatedTime: '30m', tags: ['fitness'], progress: 100, scheduleId: null },
  ],

  journal: {
    entries: [
      { id: 'jr-001', date: '2026-05-21', type: 'Daily Reflection', title: 'Execution over emotion', mood: 8, tags: ['focus'], content: 'Deep work block was clean.' },
      { id: 'jr-002', date: '2026-05-20', type: 'Wins', title: 'Built stable store persistence', mood: 8, tags: ['build'], content: 'Handled persist edge cases without crashes.' },
    ],
    streak: 2,
  },

  finance: {
    balanceOverview: {
      totalBalance: 42500,
      checking: 12400,
      savings: 28500,
      cash: 1600,
    },
    transactions: [
      { id: 'txn-001', date: '2026-05-21', type: 'expense', category: 'Food', amount: 220, note: 'Oats and fruits' },
      { id: 'txn-002', date: '2026-05-20', type: 'expense', category: 'Subscriptions', amount: 499, note: 'Cloud storage' },
    ],
    savingsGoals: [
      { id: 'save-1', title: 'Emergency Fund', target: 100000, current: 28500, dueDate: '2026-12-31' },
    ],
  },

  fitness: {
    targets: {
      calories: 2500,
      protein: 140,
      hydrationMl: 3500,
      weeklyWorkouts: 5,
    },
    workouts: [
      { id: 'wo-001', date: '2026-05-21', type: 'Push', durationMin: 45, caloriesBurned: 300, intensity: 'medium', completed: true },
      { id: 'wo-002', date: '2026-05-19', type: 'Pull', durationMin: 50, caloriesBurned: 350, intensity: 'high', completed: true },
    ],
    meals: [
      { id: 'meal-001', date: '2026-05-21', meal: 'Breakfast', title: 'Oats + milk + banana', calories: 510, protein: 24 },
    ],
    hydrationLogs: [
      { id: 'water-001', date: '2026-05-21', amountMl: 700 },
    ],
    bodyMetrics: [
      { date: '2026-05-21', weightKg: 75.1, bodyFat: 17.8, waistCm: 84.2 },
    ],
    routines: [
      { day: 'Monday', plan: 'Push Day' },
    ],
  },

  crm: {
    contacts: [
      { id: 'ct-001', name: 'Aarav Mehta', connectionContext: 'College friend', tags: ['friend', 'study'], notes: 'DSA partner.', lastInteraction: '2026-05-20' },
      { id: 'ct-002', name: 'Rohan Iyer', connectionContext: 'Senior mentor', tags: ['mentor'], notes: 'Career guidance.', lastInteraction: '2026-05-15' },
    ],
    reminders: [],
    interactionLog: [],
  },

  academics: {
    currentSemester: 'Semester 6',
    termEndDate: '2026-07-30',
    subjects: [
      { id: 'sub-001', name: 'Data Structures', code: 'CS601', progress: 68 },
      { id: 'sub-002', name: 'Operating Systems', code: 'CS602', progress: 62 },
    ],
    assignments: [],
    practicals: [],
    revisionLogs: [],
    codingProgress: {
      solvedProblems: 184,
      targetProblems: 260,
      streakDays: 12,
      weeklySolved: 19,
    },
    projects: [],
  },

  profile: {
    identity: {
      fullName: 'Bhuvaneshwaran',
      displayName: 'Bhu',
      location: 'Bengaluru, India',
      timezone: 'IST'
    },
    physical: {
      heightCm: 175,
      weightKg: 72
    },
    academics: {
      semester: 'Semester 6'
    },
    productivity: {
      deepWorkHours: 4
    },
    lifestyle: {
      hobbies: ['Coding', 'Fitness']
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
  ]
};
