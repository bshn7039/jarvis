/**
 * Utility functions for token estimation and string manipulation within the JARVIS AI subsystem.
 */

/**
 * Estimates the token count of a text string or serializable object.
 * Based on the standard heuristic of ~4 characters per token.
 * 
 * @param {string|object} content The text or object to estimate.
 * @returns {number} The estimated token count.
 */
export function estimateTokens(content) {
  if (content === null || content === undefined) {
    return 0;
  }
  
  const text = typeof content === 'string' ? content : JSON.stringify(content);
  return Math.ceil(text.length / 4);
}

/**
 * Truncates a string to a maximum number of estimated tokens.
 * 
 * @param {string} text The string to truncate.
 * @param {number} maxTokens The maximum allowed tokens.
 * @returns {string} The truncated string.
 */
export function truncateToTokenLimit(text, maxTokens) {
  if (!text) return '';
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) {
    return text;
  }
  return text.slice(0, maxChars) + '... [context truncated due to limit]';
}
