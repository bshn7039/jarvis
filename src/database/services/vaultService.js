import { BaseService } from './baseService';
import { STORES } from '../core/localDatabase';

class VaultService extends BaseService {
  constructor() {
    super(STORES.PERSONAL_VAULT);
  }
}

export const vaultService = new VaultService();
