import { localDb, STORES } from '../core/localDatabase';

class SnapshotService {
  async createSnapshot(type, data) {
    const id = `${type}-${new Date().toISOString().split('T')[0]}`;
    const snapshot = {
      id,
      type,
      timestamp: new Date().toISOString(),
      data
    };
    return localDb.put(STORES.METRICS_SNAPSHOTS, snapshot);
  }

  async getSnapshotsByType(type) {
    const all = await localDb.getAll(STORES.METRICS_SNAPSHOTS);
    return all.filter(s => s.type === type);
  }
}

export const snapshotService = new SnapshotService();
