export function createInitialModules() {
  return [
    {
      id: 'personal',
      title: 'Personal Profile',
      visible: true,
      position: { x: 300, y: 200 },
      data: [
        { id: 'personal-fullName', label: 'fullName', value: 'Alex Morgan' },
        { id: 'personal-age', label: 'age', value: '24' },
        { id: 'personal-birthday', label: 'birthday', value: '1999-08-14' },
        { id: 'personal-heightCm', label: 'heightCm', value: '178' },
        { id: 'personal-weightKg', label: 'weightKg', value: '74' },
        { id: 'personal-bodyType', label: 'bodyType', value: 'Lean' },
      ],
    },
    {
      id: 'academics',
      title: 'Academics',
      visible: true,
      position: { x: 1200, y: 300 },
      data: [
        {
          id: 'education',
          label: 'Current Education',
          children: [
            { id: 'edu-semester', label: 'semester', value: '6' },
            { id: 'edu-subjects', label: 'subjects[]', value: 'DSA, OS, DBMS, Networks' },
            { id: 'edu-assignments', label: 'assignments[]', value: '3 pending, 2 submitted' },
          ],
        },
        {
          id: 'skills',
          label: 'Skills In Progress',
          children: [
            { id: 'skills-react', label: 'React', value: 'Active' },
            { id: 'skills-firebase', label: 'Firebase', value: 'In progress' },
            { id: 'skills-dsa', label: 'DSA', value: '65%' },
          ],
        },
        { id: 'revision', label: 'Revision Deck', value: '42 cards due this week' },
        { id: 'academics-dsa', label: 'dsaProgress', value: '65%' },
        { id: 'academics-project', label: 'currentProject', value: 'Jarvis OS' },
      ],
    },
    {
      id: 'fitness',
      title: 'Fitness',
      visible: true,
      position: { x: 700, y: 1200 },
      data: [
        { id: 'fitness-protein', label: 'proteinTarget', value: '140g' },
        { id: 'fitness-split', label: 'workoutSplit', value: 'Push / Pull / Legs' },
        { id: 'fitness-sessions', label: 'weeklySessions', value: '5' },
        { id: 'fitness-last', label: 'lastWorkout', value: 'Pull — 52 min' },
      ],
    },
    {
      id: 'journal',
      title: 'Journal',
      visible: true,
      position: { x: 1800, y: 900 },
      data: [
        { id: 'journal-mood', label: 'moodScore', value: '7/10' },
        { id: 'journal-reflection', label: 'reflection', value: '"Need better consistency."' },
        { id: 'journal-date', label: 'entryDate', value: '2026-05-20' },
        { id: 'journal-streak', label: 'streak', value: '12 days' },
      ],
    },
    {
      id: 'trading',
      title: 'Trading',
      visible: false,
      position: { x: 2600, y: 600 },
      data: [
        { id: 'trading-portfolio', label: 'portfolio', value: 'Paper — $10,000' },
        { id: 'trading-watchlist', label: 'watchlist', value: 'NVDA, AAPL, MSFT' },
        { id: 'trading-positions', label: 'openPositions', value: '0' },
      ],
    },
  ];
}
