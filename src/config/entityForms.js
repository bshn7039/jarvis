export const taskEntityFormConfig = [
  { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Task title' },
  { name: 'description', label: 'Description', type: 'textarea', placeholder: 'What needs to be done?' },
  {
    name: 'bucket',
    label: 'Bucket',
    type: 'select',
    options: [
      { value: 'today', label: 'Today' },
      { value: 'week', label: 'Week' },
      { value: 'month', label: 'Month' },
      { value: 'undefined', label: 'Undefined' },
      { value: 'completed', label: 'Completed' },
    ],
  },
  {
    name: 'priority',
    label: 'Priority',
    type: 'select',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'critical', label: 'Critical' },
    ],
  },
  { name: 'category', label: 'Category', type: 'text', placeholder: 'System' },
  { name: 'progress', label: 'Progress', type: 'number' },
  { name: 'dueDate', label: 'Due Date', type: 'date' },
  { name: 'subTags', label: 'Subtags', type: 'tags', placeholder: 'jarvis,revision,gym' },
  { name: 'completionNotes', label: 'Completion Notes', type: 'textarea', placeholder: 'Lessons, blockers, outcomes...' },
];

export const journalEntityFormConfig = [
  { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Entry title' },
  { name: 'entryDate', label: 'Date', type: 'date', required: true },
  { name: 'type', label: 'Type', type: 'text', placeholder: 'Reflection, Log, Thoughts...' },
  { name: 'mood', label: 'Mood (1-10)', type: 'number', placeholder: '1-10' },
  { name: 'tags', label: 'Tags', type: 'tags', placeholder: 'coding, productivity, health' },
  { name: 'aspects', label: 'Aspects', type: 'tags', placeholder: 'Academics, Fitness, Personal' },
];

export const crmEntityFormConfig = [
  { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Contact name' },
  { name: 'nickname', label: 'Nickname', type: 'text', placeholder: 'Optional nickname' },
  {
    name: 'relationshipType',
    label: 'Relationship Type',
    type: 'select',
    options: [
      { value: 'friend', label: 'Friend' },
      { value: 'family', label: 'Family' },
      { value: 'college', label: 'College' },
      { value: 'online', label: 'Online' },
      { value: 'mentor', label: 'Mentor' },
      { value: 'professional', label: 'Professional' },
      { value: 'creator', label: 'Creator' },
      { value: 'other', label: 'Other' },
    ],
  },
  { name: 'phone', label: 'Phone', type: 'text', placeholder: 'Phone number' },
  { name: 'email', label: 'Email', type: 'text', placeholder: 'Email address' },
  { name: 'socialLinks', label: 'Social Links', type: 'tags', placeholder: 'LinkedIn, Twitter, GitHub...' },
  { name: 'birthday', label: 'Birthday', type: 'date' },
  { name: 'location', label: 'Location', type: 'text', placeholder: 'City, Country' },
  { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Context about the contact...' },
  { name: 'tags', label: 'Tags', type: 'tags', placeholder: 'mentor, tech, potential-partner' },
  {
    name: 'priority',
    label: 'Priority',
    type: 'select',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
    ],
  },
  { name: 'lastInteraction', label: 'Last Interaction', type: 'date' },
];

export const academicSkillFormConfig = [
  { name: 'name', label: 'Skill Title', type: 'text', required: true, placeholder: 'e.g. React, Python' },
  { name: 'category', label: 'Category', type: 'text', placeholder: 'Frontend, Backend, DSA...' },
  { name: 'progress', label: 'Progress (%)', type: 'number', placeholder: '0-100' },
  {
    name: 'difficulty',
    label: 'Difficulty',
    type: 'select',
    options: [
      { value: 'Beginner', label: 'Beginner' },
      { value: 'Intermediate', label: 'Intermediate' },
      { value: 'Advanced', label: 'Advanced' },
      { value: 'Expert', label: 'Expert' },
    ],
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'Learning', label: 'Learning' },
      { value: 'Practicing', label: 'Practicing' },
      { value: 'Mastered', label: 'Mastered' },
      { value: 'Stale', label: 'Stale' },
    ],
  },
  { name: 'notes', label: 'Notes', type: 'textarea' },
  { name: 'resources', label: 'Resources (URLs)', type: 'tags', placeholder: 'https://react.dev, https://...' },
];

export const academicSubjectFormConfig = [
  { name: 'name', label: 'Subject Name', type: 'text', required: true },
  { name: 'code', label: 'Course Code', type: 'text' },
  { name: 'credits', label: 'Credits', type: 'number' },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { value: 'Core', label: 'Core Subject' },
      { value: 'Lab', label: 'Lab / Practical' },
      { value: 'Elective', label: 'Elective' },
      { value: 'Project', label: 'Project' },
    ],
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'Ongoing', label: 'Ongoing' },
      { value: 'Completed', label: 'Completed' },
      { value: 'Upcoming', label: 'Upcoming' },
    ],
  },
  { name: 'internalMarks', label: 'Internal Marks', type: 'text', placeholder: 'e.g. 18/20' },
  { name: 'revisionStatus', label: 'Revision Status', type: 'text', placeholder: 'Not Started / In Progress / Done' },
  { name: 'weakTopics', label: 'Weak Topics', type: 'tags', placeholder: 'Recursion, Trees, etc.' },
  { name: 'vivaPrep', label: 'Viva Prep Notes', type: 'textarea' },
  { name: 'instructor', label: 'Instructor', type: 'text' },
  // Note: Units / Topics / Subtopics are managed inline in the subject card
];

export const academicProjectFormConfig = [
  { name: 'name', label: 'Project Title', type: 'text', required: true },
  {
    name: 'category',
    label: 'Type',
    type: 'select',
    options: [
      { value: 'Academic', label: 'Academic / Lab Project' },
      { value: 'Portfolio', label: 'Portfolio / Personal Project' },
    ],
  },
  { name: 'description', label: 'What are you building?', type: 'textarea', placeholder: 'Brief description of the project...' },
  { name: 'stack', label: 'Tech Stack', type: 'text', placeholder: 'Java, C++, Python, etc.' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'idea', label: 'Idea / Draft' },
      { value: 'planning', label: 'Planning' },
      { value: 'building', label: 'Building' },
      { value: 'paused', label: 'Paused' },
      { value: 'completed', label: 'Completed' },
    ],
  },
  { name: 'progress', label: 'Progress (%)', type: 'number', placeholder: '0-100' },
  { name: 'github', label: 'GitHub Repository Link', type: 'text', placeholder: 'https://github.com/...' },
  { name: 'link', label: 'Live/Demo Link', type: 'text', placeholder: 'https://...' },
  { name: 'roadmap', label: 'Next Steps / Roadmap', type: 'textarea', placeholder: 'What needs to be done next?' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

export const academicTechStackFormConfig = [
  { name: 'name', label: 'Technology / Language / Tool', type: 'text', required: true, placeholder: 'Java, Python, Git...' },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { value: 'Language', label: 'Programming Language' },
      { value: 'Framework', label: 'Framework / Library' },
      { value: 'Tool', label: 'Development Tool' },
      { value: 'Database', label: 'Database' },
      { value: 'Platform', label: 'Cloud / Platform' },
      { value: 'Other', label: 'Other' },
    ],
  },
  {
    name: 'proficiency',
    label: 'Current Proficiency',
    type: 'select',
    options: [
      { value: 'Beginner', label: 'Beginner — Just started' },
      { value: 'Intermediate', label: 'Intermediate — Can build things' },
      { value: 'Advanced', label: 'Advanced — Deep knowledge' },
    ],
  },
  { name: 'currentlyLearning', label: 'Currently Actively Learning', type: 'checkbox' },
  { name: 'notes', label: 'Notes / Resources', type: 'textarea', placeholder: 'Links, goals, or context...' },
];

export const academicLearningFormConfig = [
  { name: 'topic', label: 'Subject/Topic', type: 'text', required: true },
  { name: 'source', label: 'Source', type: 'text', placeholder: 'Course, Book, Documentation...' },
  { name: 'progress', label: 'Progress (%)', type: 'number' },
  { name: 'consistency', label: 'Consistency (%)', type: 'number' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

export const academicDsaFormConfig = [
  { name: 'title', label: 'Problem Title', type: 'text', required: true },
  {
    name: 'platform',
    label: 'Platform',
    type: 'select',
    options: [
      { value: 'LeetCode', label: 'LeetCode' },
      { value: 'GeeksforGeeks', label: 'GeeksforGeeks' },
      { value: 'CodeChef', label: 'CodeChef' },
      { value: 'HackerRank', label: 'HackerRank' },
      { value: 'Other', label: 'Other' },
    ],
  },
  {
    name: 'difficulty',
    label: 'Difficulty',
    type: 'select',
    options: [
      { value: 'Easy', label: 'Easy' },
      { value: 'Medium', label: 'Medium' },
      { value: 'Hard', label: 'Hard' },
    ],
  },
  { name: 'notes', label: 'Solution Notes / Approach', type: 'textarea' },
  { name: 'date', label: 'Solved Date', type: 'date' },
];

export const academicDsaProgressFormConfig = [
  { name: 'targetProblems', label: 'Target Problems', type: 'number' },
  { name: 'currentTopic', label: 'Current Focus Topic', type: 'text' },
  { name: 'weakTopics', label: 'Weak Topics', type: 'tags', placeholder: 'DP, Graphs, Trees' },
];

export const profileEntityFormConfig = [
  { name: 'degree.collegeName', label: 'College Name', type: 'text', placeholder: 'Pillai New Panvel' },
  { name: 'degree.entry', label: 'Entry Mode', type: 'text', placeholder: 'Lateral Entry (DSE)' },
  { name: 'degree.durationYears', label: 'Duration (Years)', type: 'number', placeholder: '3' },
  { name: 'degree.totalSemesters', label: 'Total Semesters', type: 'number', placeholder: '6' },
  { name: 'degree.cgpa', label: 'Current CGPA', type: 'number', placeholder: '0.0' },
  { name: 'degree.targetCgpa', label: 'Target CGPA', type: 'number', placeholder: '8' },
];

export const academicCertificationFormConfig = [
  { name: 'course', label: 'Course/Certification', type: 'text', required: true },
  { name: 'platform', label: 'Platform', type: 'text', placeholder: 'Coursera, Udemy, etc.' },
  { name: 'progress', label: 'Progress (%)', type: 'number' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'In Progress', label: 'In Progress' },
      { value: 'Completed', label: 'Completed' },
      { value: 'Dropped', label: 'Dropped' },
    ],
  },
  { name: 'certificateLink', label: 'Certificate Link', type: 'text' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

export const academicPortfolioFormConfig = [
  { name: 'title', label: 'Item Title', type: 'text', required: true },
  { name: 'link', label: 'Live Link', type: 'text' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

// Personal Section Configs
export const selfCareFormConfig = [
  { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Routine title' },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { value: 'skincare', label: 'Skincare' },
      { value: 'haircare', label: 'Haircare' },
      { value: 'grooming', label: 'Grooming' },
      { value: 'hygiene', label: 'Hygiene' },
      { value: 'appearance', label: 'Appearance' },
      { value: 'health', label: 'Health' },
    ],
  },
  {
    name: 'routineType',
    label: 'Routine Type',
    type: 'select',
    options: [
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'custom', label: 'Custom' },
    ],
  },
  { name: 'reminderFrequency', label: 'Reminder Frequency', type: 'text', placeholder: 'e.g. Every morning' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
  { name: 'tags', label: 'Tags', type: 'tags', placeholder: 'morning, night, spa' },
  { name: 'linkedTaskIds', label: 'Linked Tasks', type: 'tags', placeholder: 'Task IDs...' },
  {
    name: 'status',
    label: 'Initial Status',
    type: 'select',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'completed', label: 'Completed' },
    ],
  },
];

export const communicationFormConfig = [
  { name: 'title', label: 'Session Title', type: 'text', required: true },
  {
    name: 'type',
    label: 'Focus Area',
    type: 'select',
    options: [
      { value: 'speaking', label: 'Speaking' },
      { value: 'articulation', label: 'Articulation' },
      { value: 'confidence', label: 'Confidence' },
      { value: 'presentation', label: 'Presentation' },
      { value: 'vocal_training', label: 'Voice Training' },
      { value: 'breathing', label: 'Breathing' },
    ],
  },
  { name: 'duration', label: 'Duration (m)', type: 'text', placeholder: '15m, 30m' },
  { name: 'rating', label: 'Session Rating (1-5)', type: 'number' },
  { name: 'notes', label: 'Insights/Notes', type: 'textarea' },
  { name: 'linkedTaskIds', label: 'Linked Tasks', type: 'tags' },
];

export const socialGrowthFormConfig = [
  { name: 'title', label: 'Interaction Title', type: 'text', required: true },
  { name: 'linkedContactId', label: 'CRM Contact ID', type: 'text' },
  {
    name: 'interactionType',
    label: 'Type',
    type: 'select',
    options: [
      { value: 'meeting', label: 'Meeting' },
      { value: 'call', label: 'Call' },
      { value: 'chat', label: 'Online Chat' },
      { value: 'event', label: 'Event' },
      { value: 'other', label: 'Other' },
    ],
  },
  { name: 'confidenceLevel', label: 'Confidence Level (1-10)', type: 'number' },
  { name: 'socialChallenge', label: 'Social Challenge Attempted', type: 'text' },
  { name: 'outcome', label: 'Outcome', type: 'textarea' },
  { name: 'followUpDate', label: 'Follow Up Date', type: 'date' },
  { name: 'notes', label: 'Notes/Reflection', type: 'textarea' },
];

export const publicPersonaFormConfig = [
  {
    name: 'platform',
    label: 'Platform',
    type: 'select',
    options: [
      { value: 'linkedin', label: 'LinkedIn' },
      { value: 'github', label: 'GitHub' },
      { value: 'instagram', label: 'Instagram' },
      { value: 'twitter', label: 'Twitter/X' },
      { value: 'portfolio', label: 'Portfolio' },
      { value: 'youtube', label: 'YouTube' },
      { value: 'other', label: 'Other' },
    ],
  },
  { name: 'username', label: 'Username/Handle', type: 'text' },
  { name: 'profileUrl', label: 'Profile URL', type: 'text' },
  { name: 'goals', label: 'Platform Goals', type: 'textarea' },
  { name: 'contentIdeas', label: 'Content Ideas', type: 'textarea' },
  { name: 'growthNotes', label: 'Growth Notes', type: 'textarea' },
];

export const musicFormConfig = [
  { name: 'title', label: 'Practice/Piece Title', type: 'text', required: true },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { value: 'singing', label: 'Singing' },
      { value: 'guitar', label: 'Guitar' },
      { value: 'flute', label: 'Flute' },
      { value: 'music_theory', label: 'Music Theory' },
      { value: 'practice', label: 'General Practice' },
    ],
  },
  { name: 'duration', label: 'Duration', type: 'text', placeholder: '45m' },
  { name: 'skillFocus', label: 'Skill Focus', type: 'text', placeholder: 'Scales, vibrato, etc.' },
  { name: 'recordingLink', label: 'Recording Link', type: 'text' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

export const writingFormConfig = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    options: [
      { value: 'lyrics', label: 'Lyrics' },
      { value: 'poetry', label: 'Poetry' },
      { value: 'journaling', label: 'Journaling' },
      { value: 'script', label: 'Script' },
      { value: 'creative_writing', label: 'Creative Writing' },
      { value: 'ideas', label: 'Ideas' },
    ],
  },
  { name: 'content', label: 'Content', type: 'textarea' },
  { name: 'mood', label: 'Mood', type: 'text' },
  { name: 'tags', label: 'Tags', type: 'tags' },
  { name: 'linkedGoalIds', label: 'Linked Goals', type: 'tags' },
  { name: 'linkedJournalIds', label: 'Linked Journal Entries', type: 'tags' },
];

export const readingFormConfig = [
  { name: 'title', label: 'Book/Resource Title', type: 'text', required: true },
  { name: 'author', label: 'Author/Creator', type: 'text' },
  { name: 'category', label: 'Category', type: 'text', placeholder: 'Fiction, Tech, Bio...' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'planned', label: 'Planned' },
      { value: 'reading', label: 'Reading' },
      { value: 'completed', label: 'Completed' },
      { value: 'paused', label: 'Paused' },
    ],
  },
  { name: 'progress', label: 'Progress (%)', type: 'number' },
  { name: 'highlights', label: 'Key Highlights', type: 'textarea' },
  { name: 'lessons', label: 'Core Lessons', type: 'textarea' },
  { name: 'startedAt', label: 'Started Date', type: 'date' },
  { name: 'completedAt', label: 'Completed Date', type: 'date' },
];

export const vaultFormConfig = [
  { name: 'title', label: 'Idea Title', type: 'text', required: true },
  { name: 'type', label: 'Idea Type', type: 'text', placeholder: 'Project, Life, Tech...' },
  { name: 'content', label: 'Raw Idea Content', type: 'textarea' },
  { name: 'tags', label: 'Tags', type: 'tags' },
  { name: 'linkedEntityIds', label: 'Linked Entities', type: 'tags' },
  { name: 'pinned', label: 'Pin to Top', type: 'checkbox' },
];



