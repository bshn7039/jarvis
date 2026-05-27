import { BaseService } from './baseService';
import { STORES } from '../core/localDatabase';

class WritingService extends BaseService {
  constructor() {
    super(STORES.PERSONAL_WRITING);
  }
}

export const writingService = new WritingService();
