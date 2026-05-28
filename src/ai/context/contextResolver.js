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
import { getScheduleContext } from './providers/scheduleContextProvider';
import { getRoadmapContext } from './providers/roadmapContextProvider';
import { enforceBudget } from './contextBudgetManager';

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
  schedule: getScheduleContext,
  roadmap: getRoadmapContext,
};

const KEYWORD_MAP = {
  task: ['task', 'todo', 'to-do', 'homework', 'complete', 'organize', 'checklist', 'pending', 'due', 'overdue'],
  goal: ['goal', 'target', 'objective', 'achieve', 'milestone', 'vision'],
  academic: ['academic', 'degree', 'study', 'course', 'university', 'exam', 'class', 'grade', 'professor', 'syllabus', 'major', 'semester', 'subject', 'assignment', 'practical', 'revision', 'leet', 'code', 'dsa', 'skill', 'project', 'certification', 'portfolio'],
  fitness: ['fitness', 'workout', 'gym', 'exercise', 'run', 'calorie', 'weight', 'fat', 'recovery', 'sleep', 'diet', 'meal', 'food', 'hydration', 'water', 'routine'],
  finance: ['finance', 'money', 'expense', 'transaction', 'income', 'budget', 'cost', 'price', 'spend', 'payment', 'saving', 'credit', 'debit', 'account', 'mutual', 'fund', 'mf', 'nav', 'xirr', 'investment', 'portfolio'],
  journal: ['journal', 'mood', 'diary', 'thought', 'reflection', 'inconsistent', 'feeling', 'happy', 'sad', 'angry'],
  crm: ['crm', 'contact', 'lead', 'client', 'interaction', 'network', 'phone', 'meeting', 'email', 'relationship', 'friend', 'family', 'call', 'reminder'],
  activity: ['activity', 'log', 'recent', 'history', 'action'],
  profile: ['profile', 'age', 'height', 'gender', 'blood', 'location', 'timezone', 'identity', 'physical', 'user'],
  personal: ['personal', 'bio', 'hobby', 'interest', 'selfcare', 'self-care', 'music', 'writing', 'reading', 'vault', 'book', 'song', 'log', 'creative'],
  schedule: ['schedule', 'calendar', 'routine', 'slot', 'command center schedule', 'daily schedule', 'today schedule'],
  roadmap: ['roadmap', 'blueprint', 'self-improvement', 'improvement plan', 'phase', 'microdose', 'micro dose', 'skincare log', 'sleep log', 'social challenge', 'shadowbox', 'voice training', 'fighting', 'style', 'grooming'],
};

export function detectContextTypes(prompt = '', options = {}) {
  const p = String(prompt || '').toLowerCase();
  const matched = new Set();

  Object.entries(KEYWORD_MAP).forEach(([type, keywords]) => {
    if (keywords.some(kw => p.includes(kw))) {
      matched.add(type);
    }
  });

  if (matched.size === 0 && options.historyMessages && options.historyMessages.length > 0) {
    const history = [...options.historyMessages];
    // If the last message in history is the current prompt, pop it to look at previous turns
    if (history.length > 0 && history[history.length - 1].content === prompt && history[history.length - 1].role === 'user') {
      history.pop();
    }

    // Scan up to 4 previous messages in reverse order to find the first non-default context
    const recentMessages = history.slice(-4).reverse();
    for (const msg of recentMessages) {
      if (msg.role === 'assistant' && msg.contextReferences && msg.contextReferences.length > 0) {
        const nonDefault = msg.contextReferences.filter(c => !['profile', 'task', 'goal'].includes(c));
        if (nonDefault.length > 0) {
          nonDefault.forEach(c => matched.add(c));
          break; // Found recent active context, inherit it and stop
        }
      }
      if (msg.role === 'user' && msg.content) {
        const userMatched = [];
        const msgContent = msg.content.toLowerCase();
        Object.entries(KEYWORD_MAP).forEach(([type, keywords]) => {
          if (keywords.some(kw => msgContent.includes(kw))) {
            userMatched.push(type);
          }
        });
        const nonDefault = userMatched.filter(c => !['profile', 'task', 'goal'].includes(c));
        if (nonDefault.length > 0) {
          nonDefault.forEach(c => matched.add(c));
          break; // Found recent active context, inherit it and stop
        }
      }
    }
  }

  if (matched.size === 0) {
    return ['profile', 'task', 'goal'];
  }

  return Array.from(matched);
}

export function buildAiContext(prompt, options = {}) {
  const matchedTypes = detectContextTypes(prompt, options);
  let contextData = {};

  matchedTypes.forEach(type => {
    const provider = PROVIDERS[type];
    if (provider) {
      try {
        contextData[type] = provider(prompt);
      } catch (err) {
        console.error(`[ContextResolver] Provider '${type}' failed:`, err);
      }
    }
  });

  // Enforce limits and token budgets
  contextData = enforceBudget(contextData, prompt);

  const formattedString = JSON.stringify(contextData, null, 2);

  return {
    contextSummary: Object.keys(contextData).filter(k => k !== 'truncated'),
    contextData,
    formattedString
  };
}

