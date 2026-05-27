import { BaseService } from './baseService';
import { STORES } from '../core/localDatabase';

class ReadingService extends BaseService {
  constructor() {
    super(STORES.PERSONAL_READING);
  }
}

export const readingService = new ReadingService();
