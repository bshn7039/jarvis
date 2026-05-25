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

  schedules: [
    { id: 'sch-001', label: 'Morning Deep Work', date: '2026-05-21', time: '06:30', module: 'System', taskIds: [] },
  ],

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
    entries: [
      { 
        id: 'jr-001', 
        date: '2026-05-23', 
        entryDate: '2026-05-23', 
        type: 'Daily Reflection', 
        title: 'Morning Momentum', 
        mood: 9, 
        tags: ['productivity', 'focus'], 
        aspects: ['Academics'],
        content: 'Started the day with deep work on the refactor. Feeling extremely sharp.',
        linkedTaskIds: [],
        linkedGoalIds: ['sub-1-1-5-1'],
        archived: false,
        favorite: true
      },
      { 
        id: 'jr-002', 
        date: '2026-05-23', 
        entryDate: '2026-05-23', 
        type: 'Log', 
        title: 'Midday System Check', 
        mood: 7, 
        tags: ['system'], 
        aspects: ['Coding'],
        content: 'IndexedDB migration successful. No hydration issues detected.',
        linkedTaskIds: [],
        linkedGoalIds: [],
        archived: false,
        favorite: false
      },
      { 
        id: 'jr-003', 
        date: '2026-05-22', 
        entryDate: '2026-05-22', 
        type: 'Reflection', 
        title: 'End of Week Review', 
        mood: 8, 
        tags: ['review'], 
        aspects: ['Academics', 'Fitness'],
        content: 'Good progress on React fundamentals this week. Workout consistency is at 80%.',
        linkedTaskIds: [],
        linkedGoalIds: ['goal-1-1', 'goal-2-1'],
        archived: false,
        favorite: false
      },
      { 
        id: 'jr-004', 
        date: '2026-05-21', 
        entryDate: '2026-05-21', 
        type: 'Thoughts', 
        title: 'Late Night Musings', 
        mood: 6, 
        tags: ['undefined'], 
        aspects: ['Personal'],
        content: 'Need to improve sleep hygiene. Coding till 2 AM is counterproductive.',
        linkedTaskIds: [],
        linkedGoalIds: [],
        archived: false,
        favorite: false
      },
      { 
        id: 'jr-005', 
        date: '2026-05-20', 
        entryDate: '2026-05-20', 
        type: 'Log', 
        title: 'Fitness Session', 
        mood: 9, 
        tags: ['gym', 'pr'], 
        aspects: ['Fitness'],
        content: 'New PR on Deadlift. Energy levels are peaking.',
        linkedTaskIds: [],
        linkedGoalIds: ['obj-2-1-1'],
        archived: false,
        favorite: false
      },
      { 
        id: 'jr-006', 
        date: '2026-05-19', 
        entryDate: '2026-05-19', 
        type: 'Daily Reflection', 
        title: 'Slow Start', 
        mood: 5, 
        tags: ['sluggish'], 
        aspects: ['Personal'],
        content: 'Felt a bit drained today. Taking it easy.',
        linkedTaskIds: [],
        linkedGoalIds: [],
        archived: false,
        favorite: false
      }
    ],
    streak: 5,
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
  ],
  personal: {
    profile: {
      fullName: 'Bhuvaneshwaran',
      displayName: 'Bhu',
      location: 'Bengaluru, India',
    },
    preferences: {
      sidebarCollapsed: false,
      canvasZoom: 1,
    }
  }
};
