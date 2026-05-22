import { BaseService } from './baseService';
import { STORES } from '../core/localDatabase';

class TaskService extends BaseService {
  constructor() {
    super(STORES.TASKS);
  }

  async getByStatus(status) {
    const all = await this.getAll();
    return all.filter((t) => t.bucket === status || t.status === status);
  }

  async getByGoal(goalId) {
    const all = await this.getAll();
    return all.filter((t) => (t.linkedGoalIds || []).includes(goalId) || t.linkedGoal === goalId);
  }
}

export const taskService = new TaskService();
