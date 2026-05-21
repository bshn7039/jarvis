import { BaseService } from './baseService';
import { STORES } from '../core/localDatabase';

class GoalService extends BaseService {
  constructor() {
    super(STORES.GOALS);
  }
}

export const goalService = new GoalService();
