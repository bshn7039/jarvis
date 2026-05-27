import { BaseService } from './baseService';
import { STORES } from '../core/localDatabase';

class PublicPersonaService extends BaseService {
  constructor() {
    super(STORES.PERSONAL_PUBLIC_PERSONA);
  }
}

export const publicPersonaService = new PublicPersonaService();
