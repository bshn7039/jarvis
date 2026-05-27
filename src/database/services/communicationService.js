import { BaseService } from './baseService';
import { STORES } from '../core/localDatabase';

class CommunicationService extends BaseService {
  constructor() {
    super(STORES.PERSONAL_COMMUNICATION);
  }
}

export const communicationService = new CommunicationService();
