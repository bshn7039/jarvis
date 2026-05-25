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
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'Ongoing', label: 'Ongoing' },
      { value: 'Completed', label: 'Completed' },
      { value: 'Backlog', label: 'Backlog' },
    ],
  },
  { name: 'attendance', label: 'Attendance (%)', type: 'number' },
  { name: 'syllabus', label: 'Syllabus/Topics', type: 'textarea' },
  { name: 'revisionStatus', label: 'Revision Status', type: 'text' },
  { name: 'weakTopics', label: 'Weak Topics', type: 'tags' },
  { name: 'internalMarks', label: 'Internal Marks', type: 'text' },
  { name: 'practicals', label: 'Practicals Progress', type: 'text' },
  { name: 'vivaPrep', label: 'Viva Prep Notes', type: 'textarea' },
  { name: 'instructor', label: 'Instructor', type: 'text' },
];

export const academicProjectFormConfig = [
  { name: 'name', label: 'Project Title', type: 'text', required: true },
  {
    name: 'category',
    label: 'Project Category',
    type: 'select',
    options: [
      { value: 'Academic', label: 'Academic Project' },
      { value: 'Portfolio', label: 'Portfolio Project' },
    ],
  },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'stack', label: 'Tech Stack', type: 'text', placeholder: 'React, Node, MongoDB...' },
  { name: 'progress', label: 'Progress (%)', type: 'number' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'idea', label: 'Idea' },
      { value: 'planning', label: 'Planning' },
      { value: 'building', label: 'Building' },
      { value: 'paused', label: 'Paused' },
      { value: 'completed', label: 'Completed' },
    ],
  },
  { name: 'github', label: 'GitHub Link', type: 'text' },
  { name: 'link', label: 'Live Link', type: 'text' },
  { name: 'roadmap', label: 'Roadmap/Next Steps', type: 'textarea' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

export const academicTechStackFormConfig = [
  { name: 'name', label: 'Technology', type: 'text', required: true },
  { name: 'category', label: 'Category', type: 'text', placeholder: 'Language, Framework, Tool...' },
  {
    name: 'proficiency',
    label: 'Proficiency',
    type: 'select',
    options: [
      { value: 'Beginner', label: 'Beginner' },
      { value: 'Intermediate', label: 'Intermediate' },
      { value: 'Advanced', label: 'Advanced' },
    ],
  },
  { name: 'currentlyLearning', label: 'Currently Learning', type: 'checkbox' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
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
  { name: 'degree.collegeName', label: 'College Name', type: 'text' },
  { name: 'degree.degreeName', label: 'Course Name', type: 'text' },
  { name: 'degree.semester', label: 'Current Semester', type: 'text' },
  { name: 'degree.cgpa', label: 'Current CGPA', type: 'number' },
  { name: 'degree.targetCgpa', label: 'Target CGPA', type: 'number' },
  { name: 'degree.specialization', label: 'Specialization', type: 'text' },
  { name: 'degree.entry', label: 'Entry Type', type: 'text' },
  { name: 'degree.durationYears', label: 'Duration (Years)', type: 'number' },
  { name: 'degree.totalSemesters', label: 'Total Semesters', type: 'number' },
  { name: 'degree.status', label: 'Degree Status', type: 'text' },
  { name: 'degree.academicNotes', label: 'Academic Notes', type: 'textarea' },
  { name: 'degree.transitionGoals', label: 'Transition Goals', type: 'textarea' },
  { name: 'degree.placementPrepNotes', label: 'Placement Prep Notes', type: 'textarea' },
  { name: 'degree.higherStudiesNotes', label: 'Higher Studies Notes', type: 'textarea' },
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
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'frequency', label: 'Frequency', type: 'text', placeholder: 'Daily, Weekly, etc.' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'completed', label: 'Completed' },
    ],
  },
  { name: 'notes', label: 'Notes', type: 'textarea' },
  { name: 'tags', label: 'Tags', type: 'tags', placeholder: 'skincare, hygiene' },
];

export const communicationFormConfig = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  {
    name: 'subType',
    label: 'Category',
    type: 'select',
    options: [
      { value: 'practice', label: 'Practice' },
      { value: 'articulation', label: 'Articulation' },
      { value: 'confidence', label: 'Confidence' },
      { value: 'voice', label: 'Voice Training' },
    ],
  },
  { name: 'duration', label: 'Duration', type: 'text', placeholder: '15m, 30m' },
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
  { name: 'progress', label: 'Progress (%)', type: 'number' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

export const socialGrowthFormConfig = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'reflection', label: 'Reflection', type: 'textarea' },
  { name: 'confidenceRating', label: 'Confidence (1-10)', type: 'number' },
  { name: 'outcome', label: 'Outcome', type: 'textarea' },
  { name: 'tags', label: 'Tags', type: 'tags' },
];

export const publicPersonaFormConfig = [
  {
    name: 'platform',
    label: 'Platform',
    type: 'select',
    options: [
      { value: 'LinkedIn', label: 'LinkedIn' },
      { value: 'Instagram', label: 'Instagram' },
      { value: 'Portfolio', label: 'Portfolio' },
      { value: 'Twitter/X', label: 'Twitter/X' },
      { value: 'Other', label: 'Other' },
    ],
  },
  { name: 'objective', label: 'Objective', type: 'text' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'Planning', label: 'Planning' },
      { value: 'Active', label: 'Active' },
      { value: 'Optimized', label: 'Optimized' },
    ],
  },
  { name: 'links', label: 'Links', type: 'tags' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

export const musicFormConfig = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  {
    name: 'subType',
    label: 'Category',
    type: 'select',
    options: [
      { value: 'Singing', label: 'Singing' },
      { value: 'Guitar', label: 'Guitar' },
      { value: 'Flute', label: 'Flute' },
      { value: 'Theory', label: 'Music Theory' },
    ],
  },
  { name: 'duration', label: 'Duration', type: 'text' },
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
  { name: 'progress', label: 'Progress (%)', type: 'number' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

export const writingFormConfig = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'content', label: 'Content', type: 'textarea' },
  { name: 'mood', label: 'Mood', type: 'text' },
  { name: 'tags', label: 'Tags', type: 'tags' },
];

export const readingFormConfig = [
  { name: 'title', label: 'Book Title', type: 'text', required: true },
  { name: 'author', label: 'Author', type: 'text' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'Want to Read', label: 'Want to Read' },
      { value: 'Reading', label: 'Reading' },
      { value: 'Completed', label: 'Completed' },
      { value: 'On Hold', label: 'On Hold' },
    ],
  },
  { name: 'progress', label: 'Progress (%)', type: 'number' },
  { name: 'rating', label: 'Rating (1-10)', type: 'number' },
  { name: 'summary', label: 'Summary', type: 'textarea' },
  { name: 'notes', label: 'Lessons/Notes', type: 'textarea' },
  { name: 'startedAt', label: 'Started Date', type: 'date' },
  { name: 'completedAt', label: 'Completed Date', type: 'date' },
];

export const vaultFormConfig = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'content', label: 'Idea/Concept', type: 'textarea' },
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
  { name: 'tags', label: 'Tags', type: 'tags' },
];


