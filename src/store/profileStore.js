import { create } from 'zustand';
import { profileService } from '../database/services/profileService';
import { deepClone } from '../utils/deepClone';

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

  updateSection: async (section, data) => {
    const updated = await profileService.updateSection(section, data);
    set({ profile: updated });
  },

  updateProfile: async (data) => {
    const updated = await profileService.update('root-profile', data);
    set({ profile: updated });
  }
}));
