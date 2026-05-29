/**
 * JARVIS Context Optimizer
 * Optimizes AI retrieved datasets, handles log compression, and computes token budgets
 */
class ContextOptimizer {
  /**
   * Compresses long journal logs into high-density semantic bullet points
   */
  compressJournalText(content, limit = 150) {
    if (!content) return '';
    if (content.length <= limit) return content;

    // Clean up text
    const cleanContent = content.trim().replace(/\s+/g, ' ');
    
    // Split into sentences
    const sentences = cleanContent.split(/(?<=[.!?])\s+/);
    if (sentences.length <= 2) {
      return cleanContent.slice(0, limit) + '...';
    }

    // Heuristically select high-density milestone sentences
    const highValueKeywords = [
      'milestone', 'achieve', 'blocker', 'obstacle', 'fail', 'progress', 
      'priority', 'mood', 'burnout', 'fatigue', 'feel', 'learn', 'revision', 
      'gym', 'budget', 'spending', 'dsa', 'streak'
    ];

    const highValueSentences = [];
    const firstSentence = sentences[0];
    const lastSentence = sentences[sentences.length - 1];

    sentences.forEach((sentence, index) => {
      // Always favor first and last sentence
      if (index === 0 || index === sentences.length - 1) return;

      const sentenceLower = sentence.toLowerCase();
      const hasKeyword = highValueKeywords.some(keyword => sentenceLower.includes(keyword));
      
      if (hasKeyword && sentence.length > 10) {
        highValueSentences.push(sentence);
      }
    });

    // Package compressed result
    const selected = [firstSentence, ...highValueSentences.slice(0, 2), lastSentence];
    const compressed = selected.join(' ');
    
    return compressed.length <= limit 
      ? compressed 
      : compressed.slice(0, limit - 3) + '...';
  }

  /**
   * Cleans and filters duplicate or low-value activity stream logs
   */
  optimizeActivityLogs(activities, limit = 10) {
    if (!activities || !Array.isArray(activities)) return [];
    
    // Filter out generic boilerplate logs
    const filtered = activities.filter(act => {
      const desc = (act.description || '').toLowerCase();
      return !desc.includes('opened page') && !desc.includes('viewed dashboard');
    });

    // Keep unique activity summaries
    const unique = [];
    const seenDescriptions = new Set();
    
    for (const act of filtered) {
      const key = act.description || '';
      if (!seenDescriptions.has(key)) {
        seenDescriptions.add(key);
        unique.push(act);
      }
      if (unique.length >= limit) break;
    }

    return unique;
  }

  /**
   * Evaluates character size of a payload and estimates token budget
   */
  getBudgetMetadata(contextData, maxTokens = 8192) {
    const serialized = JSON.stringify(contextData);
    const charCount = serialized.length;
    // Estimate: ~4 characters per token
    const estimatedTokens = Math.ceil(charCount / 4);
    const withinBudget = estimatedTokens <= maxTokens;

    return {
      charCount,
      estimatedTokens,
      withinBudget,
      remainingTokens: Math.max(maxTokens - estimatedTokens, 0),
      percentageUsed: Math.min(Math.round((estimatedTokens / maxTokens) * 100), 100)
    };
  }
}

export const contextOptimizer = new ContextOptimizer();
