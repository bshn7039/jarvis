import { BaseService } from './baseService';
import { STORES } from '../core/localDatabase';

class PersonalRoadmapService extends BaseService {
  constructor() {
    super(STORES.PERSONAL);
  }

  async getRoadmaps() {
    const all = await this.getAll();
    return all.filter(item => item.type === 'personal_roadmap');
  }

  async saveRoadmap(roadmap) {
    const data = {
      ...roadmap,
      type: 'personal_roadmap',
      updatedAt: new Date().toISOString()
    };
    return this.create(data);
  }

  async updateRoadmap(id, updates) {
    const existing = await this.getById(id);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await this.update(id, updated);
    return updated;
  }
}

export const personalRoadmapService = new PersonalRoadmapService();
