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
    const updated = {
      ...profile,
      [section]: {
        ...profile[section],
        ...data
      }
    };
    return this.update('root-profile', updated);
  }
}

export const profileService = new ProfileService();
