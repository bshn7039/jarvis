import { mockDatabase } from '../data/mockDatabase';
import { createPersistedStore } from './persistHelpers';

const initialEntries = mockDatabase.journal.entries;

const initialState = {
  entries: initialEntries,
  selectedEntryId: initialEntries[0]?.id ?? null,
  searchQuery: '',
  activeType: 'All',
  activeTag: 'All',
  calendarPlaceholderOpen: false,
};

export const useJournalStore = createPersistedStore({
  name: 'jarvis-journal',
  initialState,
  partialize: (state) => ({
    entries: state.entries,
    selectedEntryId: state.selectedEntryId,
    searchQuery: state.searchQuery,
    activeType: state.activeType,
    activeTag: state.activeTag,
    calendarPlaceholderOpen: state.calendarPlaceholderOpen,
  }),
  actions: (set) => ({
    setSelectedEntryId: (entryId) => set({ selectedEntryId: entryId }),
    setSearchQuery: (value) => set({ searchQuery: value }),
    setActiveType: (value) => set({ activeType: value }),
    setActiveTag: (value) => set({ activeTag: value }),
    toggleCalendarPlaceholder: () =>
      set((state) => ({ calendarPlaceholderOpen: !state.calendarPlaceholderOpen })),
    updateEntryContent: (entryId, content) =>
      set((state) => ({
        entries: state.entries.map((entry) =>
          entry.id === entryId ? { ...entry, content } : entry,
        ),
      })),
    updateEntryMood: (entryId, mood) =>
      set((state) => ({
        entries: state.entries.map((entry) =>
          entry.id === entryId
            ? { ...entry, mood: Math.max(1, Math.min(10, Number(mood) || 1)) }
            : entry,
        ),
      })),
    addEntry: (partial) =>
      set((state) => {
        const next = {
          id: `jr-local-${Date.now()}`,
          date: partial.date || '2026-05-21',
          type: partial.type || 'Thoughts',
          title: partial.title || 'Quick Note',
          mood: partial.mood || 6,
          tags: partial.tags || ['quick'],
          linkedTaskId: partial.linkedTaskId || null,
          content: partial.content || 'Captured from Journal module.',
        };
        return {
          entries: [next, ...state.entries],
          selectedEntryId: next.id,
        };
      }),
  }),
});
