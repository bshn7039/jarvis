import { BaseService } from './baseService';
import { STORES } from '../core/localDatabase';

class FinanceService extends BaseService {
  constructor() {
    super(STORES.FINANCE_TRANSACTIONS);
  }
}

export const financeService = new FinanceService();
