import { BaseService } from './baseService';
import { STORES } from '../core/localDatabase';

class SavingsGoalService extends BaseService {
  constructor() {
    super(STORES.SAVINGS_GOALS);
  }
}

export const savingsGoalService = new SavingsGoalService();
