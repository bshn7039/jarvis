import { create } from 'zustand';
import { journalService } from '../database/services/journalService';
import { deepClone } from '../utils/deepClone';

const initialState = {
  entries: [],
  selectedEntryId: null,
  searchQuery: '',
  activeType: 'All',
  activeTag: 'All',
  calendarPlaceholderOpen: false,
  isHydrated: false,
};

export const useJournalStore = create((set, get) => ({
  ...deepClone(initialState),

  hydrate: async () => {
    try {
      const entries = await journalService.getAll();
      set({ 
        entries: entries.sort((a, b) => b.date.localeCompare(a.date)), 
        selectedEntryId: entries[0]?.id ?? null,
        isHydrated: true 
      });
    } catch (err) {
      console.error('Failed to hydrate journal:', err);
    }
  },

  setSelectedEntryId: (entryId) => set({ selectedEntryId: entryId }),
  setSearchQuery: (value) => set({ searchQuery: value }),
  setActiveType: (value) => set({ activeType: value }),
  setActiveTag: (value) => set({ activeTag: value }),
  
  toggleCalendarPlaceholder: () =>
    set((state) => ({ calendarPlaceholderOpen: !state.calendarPlaceholderOpen })),

  updateEntryContent: async (entryId, content) => {
    const entries = get().entries;
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    const updatedEntry = { ...entry, content };
    await journalService.update(entryId, updatedEntry);
    set({ entries: entries.map(e => e.id === entryId ? updatedEntry : e) });
  },

  updateEntryMood: async (entryId, mood) => {
    const entries = get().entries;
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    const updatedEntry = { ...entry, mood: Math.max(1, Math.min(10, Number(mood) || 1)) };
    await journalService.update(entryId, updatedEntry);
    set({ entries: entries.map(e => e.id === entryId ? updatedEntry : e) });
  },

  addEntry: async (partial) => {
    const next = {
      date: partial.date || '2026-05-21',
      type: partial.type || 'Thoughts',
      title: partial.title || 'Quick Note',
      mood: partial.mood || 6,
      tags: partial.tags || ['quick'],
      linkedTaskId: partial.linkedTaskId || null,
      content: partial.content || 'Captured from Journal module.',
    };
    
    const savedEntry = await journalService.create(next);
    set((state) => ({
      entries: [savedEntry, ...state.entries],
      selectedEntryId: savedEntry.id,
    }));
  },
}));

