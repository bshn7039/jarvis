import { create } from 'zustand';
import { profileService } from '../database/services/profileService';
import { deepClone } from '../utils/deepClone';
import { useActivityStore } from './activityStore';
import { profileSchema } from '../database/schemas/profile.schema';

const initialState = {
  profile: null,
  isHydrated: false,
};

function normalizeProfile(profile) {
  if (!profile) return deepClone(profileSchema.defaults);
  
  const normalized = {
    ...deepClone(profileSchema.defaults),
    ...profile,
  };


  // Migrate old productivity
  if (profile.productivity?.deepWorkHours !== undefined && normalized.productivity.taskHoursTarget === 4) {
    normalized.productivity.taskHoursTarget = profile.productivity.deepWorkHours;
  }

  // Migrate old academics if possible (best effort)
  if (profile.academics && !profile.diploma?.collegeName && !profile.degree?.collegeName) {
    normalized.degree = {
      ...normalized.degree,
      collegeName: profile.academics.college || "",
      semester: profile.academics.semester || "",
      specialization: profile.academics.specialization || "",
      cgpa: profile.academics.cgpa || 0,
    };
  }

  // Handle personality profiles migration
  if (profile.lifestyle?.personalityNotes && (!normalized.personalityProfiles || normalized.personalityProfiles.length === 0)) {
    normalized.personalityProfiles = [
      { 
        title: "Initial Notes", 
        description: profile.lifestyle.personalityNotes, 
        tags: ["Legacy"] 
      }
    ];
  }

  // Final safety: Ensure personalityProfiles is an array (fixes object-corruption from previous bugs)
  if (normalized.personalityProfiles && !Array.isArray(normalized.personalityProfiles)) {
    normalized.personalityProfiles = Object.values(normalized.personalityProfiles);
  } else if (!normalized.personalityProfiles) {
    normalized.personalityProfiles = [];
  }

  // Ensure lifestyle.languages is an array
  if (normalized.lifestyle?.languages && !Array.isArray(normalized.lifestyle.languages)) {
    normalized.lifestyle.languages = Object.values(normalized.lifestyle.languages);
  } else if (!normalized.lifestyle?.languages) {
    if (!normalized.lifestyle) normalized.lifestyle = {};
    normalized.lifestyle.languages = [];
  }

  return normalized;
}

export const useProfileStore = create((set, get) => ({
  ...deepClone(initialState),

  hydrate: async () => {
    try {
      let profile = await profileService.getRootProfile();
      profile = normalizeProfile(profile);
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
