export const TASK_CATEGORIES = [
  'Academics',
  'Fitness',
  'Self Care',
  'Skill Building',
  'Finance',
  'Social',
  'System',
];

export const categoryStyles = {
  Academics: 'border-jarvis-accent/25 bg-jarvis-accent/10 text-jarvis-accent',
  Fitness: 'border-jarvis-border bg-white/5 text-jarvis-text/80',
  'Self Care': 'border-jarvis-border bg-white/[0.03] text-jarvis-muted',
  'Skill Building': 'border-jarvis-muted/30 bg-jarvis-muted/10 text-jarvis-muted',
  Finance: 'border-jarvis-border bg-white/5 text-jarvis-muted',
  Social: 'border-jarvis-border bg-white/[0.03] text-jarvis-muted',
  System: 'border-jarvis-accent/15 bg-jarvis-accent/5 text-jarvis-accent/80',
};

export const taskSummaries = {
  today: { pending: 4, completed: 2, overdue: 1 },
  weekly: { active: 12, completed: 5 },
  monthly: { milestonesRemaining: 3 },
};

export const operationalHighlights = [
  { id: 'h1', label: 'Revise DSA Trees', category: 'Academics', status: 'priority' },
  { id: 'h2', label: 'Push Day Workout', category: 'Fitness', status: 'scheduled' },
  { id: 'h3', label: 'Journal Reflection', category: 'Self Care', status: 'pending' },
];

export const todayFocus = {
  deadlines: [
    { id: 'd1', label: 'DSA Assignment', date: 'Today, 6:00 PM', category: 'Academics' },
    { id: 'd2', label: 'OS Lab Report', date: 'Tomorrow', category: 'Academics' },
  ],
  aiFocus:
    'Prioritize DSA tree revision before evening workout. Block 2 hours for Firebase documentation.',
};

export const defaultGoalsTree = {
  id: 'main',
  label: 'Become Employable Developer',
  children: [
    {
      id: 'phase',
      label: 'Build Strong Fundamentals',
      children: [
        { id: 'obj-dsa', label: 'Master DSA Basics' },
        { id: 'obj-solving', label: 'Improve Problem Solving' },
        { id: 'obj-projects', label: 'Build Projects' },
      ],
    },
  ],
};

export const defaultSchedule = [
  { id: 's1', time: '08:00', label: 'Gym', status: 'done', category: 'Fitness' },
  { id: 's2', time: '10:00', label: 'Study Session', status: 'active', category: 'Academics' },
  { id: 's3', time: '14:00', label: 'Firebase Learning', status: 'upcoming', category: 'Skill Building' },
  { id: 's4', time: '18:00', label: 'Revision', status: 'upcoming', category: 'Academics' },
];

export const dailyMetrics = [
  { id: 'sleep', label: 'Sleep', value: '7h 20m', trend: '+12%', trendUp: true, icon: 'Moon' },
  { id: 'calories', label: 'Calories', value: '1,840', trend: '-4%', trendUp: false, icon: 'Flame' },
  { id: 'protein', label: 'Protein', value: '118g', trend: '74%', trendUp: false, icon: 'Beef' },
  { id: 'water', label: 'Water', value: '2.4L', trend: '+8%', trendUp: true, icon: 'Droplets' },
  { id: 'study', label: 'Study Hours', value: '3.5h', trend: '+1.2h', trendUp: true, icon: 'BookOpen' },
  { id: 'workout', label: 'Workout', value: 'Scheduled', trend: 'Push', trendUp: true, icon: 'Dumbbell' },
  { id: 'mood', label: 'Mood', value: '7/10', trend: 'Stable', trendUp: true, icon: 'Smile' },
  { id: 'tasks', label: 'Tasks Done', value: '4/9', trend: '44%', trendUp: false, icon: 'CheckSquare' },
];

export const streaks = [
  { id: 'coding', label: 'Coding', days: 12 },
  { id: 'gym', label: 'Gym', days: 7 },
  { id: 'reading', label: 'Reading', days: 5 },
  { id: 'journal', label: 'Journal', days: 14 },
];

export const weeklyProgress = [
  { id: 'study', label: 'Weekly Study Hours', value: '18.5h', target: '25h', percent: 74, bars: [40, 55, 70, 45, 80, 60, 75] },
  { id: 'fitness', label: 'Fitness Consistency', value: '5/7', target: '7 days', percent: 71, bars: [100, 100, 0, 100, 100, 100, 0] },
  { id: 'goals', label: 'Goal Completion', value: '62%', target: '100%', percent: 62, bars: [50, 58, 62, 55, 60, 65, 62] },
  { id: 'habits', label: 'Habit Consistency', value: '78%', target: '90%', percent: 78, bars: [70, 75, 80, 72, 85, 78, 82] },
];

export const aiInsights = [
  { id: 'i1', text: 'Study consistency dropped this week.', type: 'neutral' },
  { id: 'i2', text: 'Protein intake below target for 3 days.', type: 'accent' },
  { id: 'i3', text: 'DSA revision overdue.', type: 'warning' },
  { id: 'i4', text: 'Sleep schedule becoming unstable.', type: 'neutral' },
];

export const systemWarnings = [
  { id: 'w1', text: 'No workout logs for 4 days', severity: 'medium' },
  { id: 'w2', text: 'Finance tracking inactive', severity: 'low' },
  { id: 'w3', text: 'Reading streak broken', severity: 'medium' },
];

export const quickActions = [
  { id: 'expense', label: 'Add Expense', icon: 'Wallet' },
  { id: 'workout', label: 'Log Workout', icon: 'Dumbbell' },
  { id: 'journal', label: 'Add Journal Entry', icon: 'PenLine' },
  { id: 'task', label: 'Add Task', icon: 'Plus' },
  { id: 'focus', label: 'Start Focus Session', icon: 'Zap' },
];
