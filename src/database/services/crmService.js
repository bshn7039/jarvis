import { BaseService } from './baseService';
import { STORES } from '../core/localDatabase';

class CrmService extends BaseService {
  constructor() {
    super(STORES.CRM_CONTACTS);
  }
}

export const crmService = new CrmService();
