import { create } from 'zustand';
import { useMemo } from 'react';
import { journalService } from '../database/services/journalService';
import { deepClone } from '../utils/deepClone';
import { useActivityStore } from './activityStore';

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
        entries: entries.sort((a, b) => b.entryDate.localeCompare(a.entryDate)), 
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

  logActivity: async ({ action, entityId, metadata = {} }) => {
    const activityStore = useActivityStore.getState();
    await activityStore.logActivity({
      type: 'journal',
      action,
      entityType: 'journal_entry',
      entityId,
      metadata
    });
  },

  updateEntry: async (entryId, updates) => {
    const entries = get().entries;
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    const updatedEntry = { ...entry, ...updates, updatedAt: new Date().toISOString() };
    await journalService.update(entryId, updatedEntry);
    set({ entries: entries.map(e => e.id === entryId ? updatedEntry : e) });
    
    if (updates.content !== undefined || updates.title !== undefined) {
      await get().logActivity({ 
        action: 'updated', 
        entityId: entryId,
        metadata: { title: updatedEntry.title }
      });
    }
  },

  deleteEntry: async (entryId) => {
    await journalService.delete(entryId);
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== entryId),
      selectedEntryId: state.selectedEntryId === entryId ? null : state.selectedEntryId
    }));
    await get().logActivity({ action: 'deleted', entityId: entryId });
  },

  addEntry: async (partial) => {
    const today = new Date().toISOString().slice(0, 10);
    const next = {
      date: today,
      entryDate: partial.entryDate || today,
      type: partial.type || 'undefined',
      title: partial.title || 'Untitled Entry',
      mood: partial.mood ?? null,
      tags: partial.tags || ['undefined'],
      aspects: partial.aspects || [],
      linkedTaskIds: partial.linkedTaskIds || [],
      linkedGoalIds: partial.linkedGoalIds || [],
      attachments: partial.attachments || [],
      archived: partial.archived || false,
      favorite: partial.favorite || false,
      content: partial.content || '',
    };
    
    const savedEntry = await journalService.create(next);
    set((state) => ({
      entries: [savedEntry, ...state.entries].sort((a, b) => b.entryDate.localeCompare(a.entryDate)),
      selectedEntryId: savedEntry.id,
    }));
    await get().logActivity({ 
      action: 'created', 
      entityId: savedEntry.id,
      metadata: { title: savedEntry.title, mood: savedEntry.mood }
    });
  },
}));

export const useDailyMoods = () => {
  const entries = useJournalStore((s) => s.entries);
  return useMemo(() => {
    const groups = entries.reduce((acc, entry) => {
      const date = entry.entryDate;
      if (!acc[date]) acc[date] = [];
      if (entry.mood !== null) acc[date].push(entry.mood);
      return acc;
    }, {});

    const averages = {};
    Object.keys(groups).forEach(date => {
      const moods = groups[date];
      if (moods.length === 0) {
        averages[date] = null;
      } else {
        averages[date] = Math.round(moods.reduce((a, b) => a + b, 0) / moods.length);
      }
    });
    return averages;
  }, [entries]);
};

