import { BaseService } from './baseService';
import { STORES } from '../core/localDatabase';

class SocialGrowthService extends BaseService {
  constructor() {
    super(STORES.PERSONAL_SOCIAL_GROWTH);
  }
}

export const socialGrowthService = new SocialGrowthService();
