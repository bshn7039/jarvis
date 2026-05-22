import { BaseService } from './baseService';
import { STORES } from '../core/localDatabase';
import { profileSchema } from '../schemas/profile.schema';

class ProfileService extends BaseService {
  constructor() {
    super(STORES.PROFILE);
  }

  async getRootProfile() {
    const profile = await this.getById('root-profile');
    if (!profile) {
      return this.create(profileSchema.defaults);
    }
    return profile;
  }

  async updateSection(section, data) {
    const profile = await this.getRootProfile();
    
    // If data is an array, we replace the section entirely
    // If it's an object, we merge it
    const sectionData = Array.isArray(data) 
      ? data 
      : { ...profile[section], ...data };

    const updated = {
      ...profile,
      [section]: sectionData
    };
    return this.update('root-profile', updated);
  }
}

export const profileService = new ProfileService();
