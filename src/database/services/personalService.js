import { BaseService } from './baseService';
import { localDb, STORES } from '../core/localDatabase';

class PersonalService extends BaseService {
  constructor() {
    super(STORES.PERSONAL);
  }

  // Custom methods for personal store if needed
  async getByType(type) {
    const all = await this.getAll();
    return all.filter(item => item.type === type);
  }
}

export const personalService = new PersonalService();
