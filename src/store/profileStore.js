import { create } from 'zustand';
import { profileService } from '../database/services/profileService';
import { deepClone } from '../utils/deepClone';
import { useActivityStore } from './activityStore';

const initialState = {
  profile: null,
  isHydrated: false,
};

export const useProfileStore = create((set, get) => ({
  ...deepClone(initialState),

  hydrate: async () => {
    try {
      const profile = await profileService.getRootProfile();
      set({ profile, isHydrated: true });
    } catch (err) {
      console.error('Failed to hydrate profile:', err);
    }
  },

  logActivity: async ({ action, metadata = {} }) => {
    const activityStore = useActivityStore.getState();
    await activityStore.logActivity({
      type: 'profile',
      action,
      entityType: 'profile',
      entityId: 'root-profile',
      metadata
    });
  },

  updateSection: async (section, data) => {
    const updated = await profileService.updateSection(section, data);
    set({ profile: updated });
    await get().logActivity({ 
      action: 'updated', 
      metadata: { section }
    });
  },

  updateProfile: async (data) => {
    const updated = await profileService.update('root-profile', data);
    set({ profile: updated });
    await get().logActivity({ 
      action: 'updated', 
      metadata: { fields: Object.keys(data) }
    });
  }
}));
