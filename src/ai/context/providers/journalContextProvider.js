import { useJournalStore } from '../../../store/journalStore';
import { parseDatesFromPrompt } from './dateContextHelper';

export function getJournalContext(prompt) {
  const state = useJournalStore.getState();
  const entries = state.entries || [];

  const moodEntries = entries.filter(e => e.mood !== null).slice(0, 7);
  const avgMood = moodEntries.length > 0
    ? Math.round(moodEntries.reduce((sum, e) => sum + e.mood, 0) / moodEntries.length)
    : null;

  // Dynamically resolve target dates mentioned in prompt
  const targetDates = parseDatesFromPrompt(prompt);
  let matchedEntries = [];

  if (targetDates.length > 0) {
    matchedEntries = entries.filter(e => targetDates.includes(e.entryDate)).map(e => ({
      id: e.id,
      date: e.entryDate,
      title: e.title,
      mood: e.mood,
      tags: e.tags,
      content: e.content || '' // Provide full content for editing/reading target entry
    }));
  }

  // Fallback to recent 5 entries as snippets for background context
  const recentEntries = entries
    .filter(e => !matchedEntries.some(me => me.id === e.id)) // Avoid duplicates
    .slice(0, 5)
    .map(e => ({
      id: e.id,
      date: e.entryDate,
      title: e.title,
      mood: e.mood,
      tags: e.tags,
      snippet: e.content ? `${e.content.slice(0, 100).trim()}...` : ''
    }));

  return {
    metrics: {
      totalEntries: entries.length,
      recentMoodAverage: avgMood
    },
    matchedDateEntries: matchedEntries.length > 0 ? matchedEntries : undefined,
    recentEntries
  };
}
