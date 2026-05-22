import { create } from 'zustand';
import { activityService } from '../database/services/activityService';
import { deepClone } from '../utils/deepClone';

const initialState = {
  activities: [],
  isHydrated: false,
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

  logActivity: async ({ type, action, entityType, entityId, metadata = {} }) => {
    const saved = await activityService.logActivity({ type, action, entityType, entityId, metadata });
    set((state) => ({
      activities: [saved, ...state.activities],
    }));
    return saved;
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
  }
}));
