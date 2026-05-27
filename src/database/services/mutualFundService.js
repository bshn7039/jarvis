import { BaseService } from './baseService';
import { STORES } from '../core/localDatabase';

class MutualFundService extends BaseService {
  constructor() {
    super(STORES.MUTUAL_FUNDS);
  }
}

export const mutualFundService = new MutualFundService();
