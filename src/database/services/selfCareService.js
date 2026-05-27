import { BaseService } from './baseService';
import { STORES } from '../core/localDatabase';

class SelfCareService extends BaseService {
  constructor() {
    super(STORES.PERSONAL_SELF_CARE);
  }
}

export const selfCareService = new SelfCareService();
