import { useJournalStore } from '../../../store/journalStore';

export function getJournalContext() {
  const state = useJournalStore.getState();
  const entries = state.entries || [];

  const moodEntries = entries.filter(e => e.mood !== null).slice(0, 7);
  const avgMood = moodEntries.length > 0
    ? Math.round(moodEntries.reduce((sum, e) => sum + e.mood, 0) / moodEntries.length)
    : null;

  const recentEntries = entries.slice(0, 5).map(e => ({
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
    recentEntries
  };
}
