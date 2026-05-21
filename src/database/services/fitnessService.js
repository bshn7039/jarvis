import { BaseService } from './baseService';
import { STORES } from '../core/localDatabase';

class FitnessService extends BaseService {
  constructor() {
    super(STORES.FITNESS_LOGS);
  }

  async getByType(type) {
    const all = await this.getAll();
    return all.filter(l => l.type === type);
  }
}

export const fitnessService = new FitnessService();
