export const chatHistory = [
  { id: '1', date: '2026-05-20', title: 'Fitness Planning' },
  { id: '2', date: '2026-05-19', title: 'Semester Revision' },
  { id: '3', date: '2026-05-18', title: 'Finance Tracking' },
  { id: '4', date: '2026-05-17', title: 'Weekly Review' },
  { id: '5', date: '2026-05-16', title: 'Project Roadmap' },
];

export const mockMessages = [
  {
    id: 'm1',
    role: 'user',
    content: 'Help me plan a balanced workout routine for this week.',
    timestamp: '10:24 AM',
  },
  {
    id: 'm2',
    role: 'assistant',
    content: 'Here is a structured plan focusing on recovery and progressive overload. Monday and Thursday can target upper body, Tuesday and Friday lower body, with Wednesday as active recovery and the weekend for mobility work.',
    timestamp: '10:24 AM',
  },
  {
    id: 'm3',
    role: 'user',
    content: 'Can you adjust it if I only have 30 minutes per session?',
    timestamp: '10:25 AM',
  },
  {
    id: 'm4',
    role: 'assistant',
    content: 'Absolutely. I will compress each session into supersets: 5-minute warm-up, 20 minutes of compound movements, and 5 minutes of cooldown. That keeps intensity high without sacrificing form.',
    timestamp: '10:25 AM',
  },
];

export const emptyState = {
  title: 'Jarvis AI',
  subtitle: 'Your Personal Operating System',
};
