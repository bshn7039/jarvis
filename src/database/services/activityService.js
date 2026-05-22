import { BaseService } from './baseService';
import { STORES } from '../core/localDatabase';

class ActivityService extends BaseService {
  constructor() {
    super(STORES.ACTIVITIES);
  }

  async logActivity({ type, action, entityType, entityId, metadata = {} }) {
    const activity = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      action,
      entityType,
      entityId,
      timestamp: new Date().toISOString(),
      metadata
    };
    return this.create(activity);
  }

  async getRecentActivities(limit = 50) {
    const all = await this.getAll();
    return all
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, limit);
  }

  async getActivitiesByType(type, limit = 50) {
    const all = await this.getAll();
    return all
      .filter(a => a.type === type)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, limit);
  }

  async getActivitiesByEntityType(entityType, limit = 50) {
    const all = await this.getAll();
    return all
      .filter(a => a.entityType === entityType)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, limit);
  }

  async getActivitiesSince(timestamp) {
    const all = await this.getAll();
    return all
      .filter(a => a.timestamp >= timestamp)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  async getTodayActivities() {
    const today = new Date().toISOString().slice(0, 10);
    const all = await this.getAll();
    return all
      .filter(a => a.timestamp.slice(0, 10) === today)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }
}

export const activityService = new ActivityService();
