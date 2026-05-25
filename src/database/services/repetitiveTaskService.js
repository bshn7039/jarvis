import { BaseService } from './baseService';
import { STORES, localDb } from '../core/localDatabase';

class RepetitiveTaskService extends BaseService {
  constructor() {
    super(STORES.REPETITIVE_TASKS);
  }

  async getHistory() {
    return await localDb.getAll(STORES.REPETITIVE_HISTORY);
  }

  async saveHistory(historyItem) {
    return await localDb.put(STORES.REPETITIVE_HISTORY, historyItem);
  }

  async getHistoryByDate(date) {
    return await localDb.getById(STORES.REPETITIVE_HISTORY, date);
  }

  async deleteHistoryByDate(date) {
    return await localDb.delete(STORES.REPETITIVE_HISTORY, date);
  }
}

export const repetitiveTaskService = new RepetitiveTaskService();
