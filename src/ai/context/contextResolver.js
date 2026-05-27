import { getTaskContext } from './providers/taskContextProvider';
import { getGoalContext } from './providers/goalContextProvider';
import { getAcademicContext } from './providers/academicContextProvider';
import { getFitnessContext } from './providers/fitnessContextProvider';
import { getFinanceContext } from './providers/financeContextProvider';
import { getJournalContext } from './providers/journalContextProvider';
import { getCrmContext } from './providers/crmContextProvider';
import { getActivityContext } from './providers/activityContextProvider';
import { getProfileContext } from './providers/profileContextProvider';
import { getPersonalContext } from './providers/personalContextProvider';

const PROVIDERS = {
  task: getTaskContext,
  goal: getGoalContext,
  academic: getAcademicContext,
  fitness: getFitnessContext,
  finance: getFinanceContext,
  journal: getJournalContext,
  crm: getCrmContext,
  activity: getActivityContext,
  profile: getProfileContext,
  personal: getPersonalContext,
};

const KEYWORD_MAP = {
  task: ['task', 'todo', 'to-do', 'homework', 'complete', 'organize', 'checklist', 'pending', 'due', 'overdue'],
  goal: ['goal', 'target', 'objective', 'achieve', 'milestone', 'vision'],
  academic: ['academic', 'degree', 'study', 'course', 'university', 'exam', 'class', 'grade', 'professor', 'syllabus', 'major', 'semester', 'subject', 'assignment', 'practical', 'revision', 'leet', 'code', 'dsa', 'skill', 'project', 'certification', 'portfolio'],
  fitness: ['fitness', 'workout', 'gym', 'exercise', 'run', 'calorie', 'weight', 'fat', 'recovery', 'sleep', 'diet', 'meal', 'food', 'hydration', 'water', 'routine'],
  finance: ['finance', 'money', 'expense', 'transaction', 'income', 'budget', 'cost', 'price', 'spend', 'payment', 'saving', 'credit', 'debit', 'account'],
  journal: ['journal', 'mood', 'diary', 'thought', 'reflection', 'inconsistent', 'feeling', 'happy', 'sad', 'angry'],
  crm: ['crm', 'contact', 'lead', 'client', 'interaction', 'network', 'phone', 'meeting', 'email', 'relationship', 'friend', 'family', 'call', 'reminder'],
  activity: ['activity', 'log', 'recent', 'history', 'action'],
  profile: ['profile', 'age', 'height', 'gender', 'blood', 'location', 'timezone', 'identity', 'physical', 'user'],
  personal: ['personal', 'bio', 'hobby', 'interest', 'selfcare', 'self-care', 'music', 'writing', 'reading', 'vault', 'book', 'song', 'log', 'creative']
};

export function detectContextTypes(prompt) {
  const p = prompt.toLowerCase();
  const matched = [];

  Object.entries(KEYWORD_MAP).forEach(([type, keywords]) => {
    if (keywords.some(kw => p.includes(kw))) {
      matched.push(type);
    }
  });

  if (matched.length === 0) {
    matched.push('profile', 'task', 'goal');
  }

  return matched;
}

export function buildAiContext(prompt, options = {}) {
  const matchedTypes = detectContextTypes(prompt);
  const contextData = {};

  matchedTypes.forEach(type => {
    const provider = PROVIDERS[type];
    if (provider) {
      try {
        contextData[type] = provider();
      } catch (err) {
        console.error(`[ContextResolver] Provider '${type}' failed:`, err);
      }
    }
  });

  const maxChars = options.maxChars || 12000;
  let formattedString = JSON.stringify(contextData, null, 2);
  
  if (formattedString.length > maxChars) {
    console.warn(`[ContextResolver] Context size (${formattedString.length} chars) exceeds budget limit. Truncating...`);
    const minimalContext = {
      profile: PROVIDERS.profile ? PROVIDERS.profile() : {},
      task: PROVIDERS.task ? PROVIDERS.task() : {},
      goal: PROVIDERS.goal ? PROVIDERS.goal() : {}
    };
    contextData.truncated = true;
    formattedString = JSON.stringify(minimalContext, null, 2);
  }

  return {
    contextSummary: Object.keys(contextData).filter(k => k !== 'truncated'),
    contextData,
    formattedString
  };
}
