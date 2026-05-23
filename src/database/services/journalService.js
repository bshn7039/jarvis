import { BaseService } from './baseService';
import { STORES } from '../core/localDatabase';

class JournalService extends BaseService {
  constructor() {
    super(STORES.JOURNAL_ENTRIES);
  }

  async getByDate(date) {
    const all = await this.getAll();
    return all.filter(e => e.entryDate === date);
  }
}

export const journalService = new JournalService();
