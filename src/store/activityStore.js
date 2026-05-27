import { create } from 'zustand';
import { activityService } from '../database/services/activityService';
import { deepClone } from '../utils/deepClone';

const initialState = {
  activities: [],
  isHydrated: false,
  filter: {
    type: 'all',
    severity: 'all',
    search: ''
  }
};

export const useActivityStore = create((set, get) => ({
  ...deepClone(initialState),

  hydrate: async () => {
    try {
      const activities = await activityService.getAll();
      set({ 
        activities: activities.sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
        isHydrated: true 
      });
    } catch (err) {
      console.error('Failed to hydrate activities:', err);
    }
  },

  logActivity: async ({ type, action, entityType, entityId, metadata = {}, severity = 'info' }) => {
    const saved = await activityService.logActivity({ 
      type, 
      action, 
      entityType, 
      entityId, 
      metadata,
      severity 
    });
    set((state) => ({
      activities: [saved, ...state.activities],
    }));
    return saved;
  },

  setFilter: (newFilter) => set((state) => ({
    filter: { ...state.filter, ...newFilter }
  })),

  getFilteredActivities: () => {
    const { activities, filter } = get();
    return activities.filter(a => {
      const matchType = filter.type === 'all' || a.type === filter.type;
      const matchSeverity = filter.severity === 'all' || a.severity === filter.severity;
      const matchSearch = !filter.search || 
        a.action.toLowerCase().includes(filter.search.toLowerCase()) ||
        a.entityType?.toLowerCase().includes(filter.search.toLowerCase()) ||
        (a.metadata?.title || '').toLowerCase().includes(filter.search.toLowerCase());
      
      return matchType && matchSeverity && matchSearch;
    });
  },

  getRecentActivities: (limit = 50) => {
    return get().activities.slice(0, limit);
  },

  getTodayActivities: () => {
    const today = new Date().toISOString().slice(0, 10);
    return get().activities.filter(a => a.timestamp.slice(0, 10) === today);
  },

  getActivitiesByType: (type) => {
    return get().activities.filter(a => a.type === type);
  },

  getActivitiesByEntityType: (entityType) => {
    return get().activities.filter(a => a.entityType === entityType);
  },

  clearHistory: async () => {
    await activityService.clear();
    set({ activities: [] });
  }
}));
