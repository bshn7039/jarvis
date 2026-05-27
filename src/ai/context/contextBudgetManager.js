export const BUDGET_LIMITS = {
  MAX_CONTEXT_OBJECTS: 5,
  MAX_TASKS: 10,
  MAX_JOURNAL_ENTRIES: 5,
  MAX_CHAT_HISTORY: 10,
  MAX_ESTIMATED_TOKENS: 4000,
};

/**
 * Roughly estimates the token count of a given object or string.
 * Uses a standard character-to-token heuristic (charCount / 4).
 */
export function estimateTokens(obj) {
  if (obj === null || obj === undefined) return 0;
  const str = typeof obj === 'string' ? obj : JSON.stringify(obj);
  return Math.ceil(str.length / 4);
}

/**
 * Returns a priority list of domains based on matching prompts.
 * Essential profile info and user identity are always kept highest priority.
 */
export function getDomainPriorities(prompt, matchedDomains) {
  const p = prompt.toLowerCase();
  
  // Base default domains ranked by operational importance
  const defaultImportance = [
    'profile',
    'task',
    'goal',
    'academic',
    'fitness',
    'finance',
    'journal',
    'crm',
    'activity',
    'personal'
  ];

  // Put matched domains at the front (after profile)
  const priority = ['profile'];
  
  matchedDomains.forEach(domain => {
    if (domain !== 'profile' && !priority.includes(domain)) {
      priority.push(domain);
    }
  });

  // Add the remaining default domains
  defaultImportance.forEach(domain => {
    if (!priority.includes(domain)) {
      priority.push(domain);
    }
  });

  return priority;
}

/**
 * Shrinks lists inside the context domains to fit within limits.
 */
export function truncateContextCollections(contextData) {
  const data = { ...contextData };

  if (data.task && Array.isArray(data.task.focusedTasks)) {
    data.task.focusedTasks = data.task.focusedTasks.slice(0, BUDGET_LIMITS.MAX_TASKS);
  }

  if (data.journal && Array.isArray(data.journal.recentEntries)) {
    data.journal.recentEntries = data.journal.recentEntries.slice(0, BUDGET_LIMITS.MAX_JOURNAL_ENTRIES);
  }

  if (data.fitness) {
    if (Array.isArray(data.fitness.recentWorkouts)) {
      data.fitness.recentWorkouts = data.fitness.recentWorkouts.slice(0, 5);
    }
    if (Array.isArray(data.fitness.recentMeals)) {
      data.fitness.recentMeals = data.fitness.recentMeals.slice(0, 5);
    }
  }

  if (data.finance && Array.isArray(data.finance.recentTransactions)) {
    data.finance.recentTransactions = data.finance.recentTransactions.slice(0, 5);
  }

  if (data.crm && Array.isArray(data.crm.recentContacts)) {
    data.crm.recentContacts = data.crm.recentContacts.slice(0, 5);
  }

  if (data.activity && Array.isArray(data.activity.recentActivities)) {
    data.activity.recentActivities = data.activity.recentActivities.slice(0, 5);
  }

  return data;
}

/**
 * Enforces hard token caps and budget limits. If the context exceeds the 
 * MAX_ESTIMATED_TOKENS, it prunes lower-priority domains until it fits.
 */
export function enforceBudget(contextData, promptText = '') {
  // 1. Truncate lists first
  let prunedData = truncateContextCollections(contextData);

  let currentTokens = estimateTokens(prunedData);
  if (currentTokens <= BUDGET_LIMITS.MAX_ESTIMATED_TOKENS) {
    return prunedData;
  }

  // 2. Prune entire domains by reverse priority (lowest first)
  const matchedDomains = Object.keys(prunedData).filter(d => d !== 'truncated');
  const priorityOrder = getDomainPriorities(promptText, matchedDomains);
  const prunable = [...priorityOrder].reverse(); // Lowest priority first

  for (const domain of prunable) {
    // Keep 'profile' as it contains the system persona/identity that's vital
    if (domain === 'profile') continue;

    if (prunedData[domain]) {
      delete prunedData[domain];
      prunedData.truncated = true;

      currentTokens = estimateTokens(prunedData);
      if (currentTokens <= BUDGET_LIMITS.MAX_ESTIMATED_TOKENS) {
        break;
      }
    }
  }

  return prunedData;
}
