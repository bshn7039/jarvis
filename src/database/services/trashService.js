import { localDb, STORES } from '../core/localDatabase';

class TrashService {
  async getAll() {
    return localDb.getAll(STORES.TRASH);
  }

  async getVersions(entityId) {
    const all = await localDb.getAll(STORES.VERSIONS);
    return all.filter(v => v.entityId === entityId).sort((a, b) => b.version - a.version);
  }

  async createSnapshot(entityType, entity, actionType = 'modified') {
    if (!entity || !entity.id) return;

    // Get current versions to increment
    const versions = await this.getVersions(entity.id);
    const nextVersion = versions.length > 0 ? (versions[0].version || 0) + 1 : 1;

    const snapshot = {
      id: `${entity.id}-${Date.now()}-v${nextVersion}`,
      entityId: entity.id,
      entityType,
      entityTitle: entity.title || entity.name || 'Untitled',
      actionType,
      version: nextVersion,
      snapshotTimestamp: new Date().toISOString(),
      data: { ...entity },
      metadata: {
        timestamp: Date.now(),
      }
    };

    await localDb.put(STORES.VERSIONS, snapshot);
    return snapshot;
  }

  async moveToTrash(entityType, entity) {
    if (!entity || !entity.id) return;

    const trashEntry = {
      id: `trash-${entity.id}-${Date.now()}`,
      entityId: entity.id,
      entityType,
      entityTitle: entity.title || entity.name || 'Untitled',
      actionType: 'deleted',
      deletedAt: new Date().toISOString(),
      data: { ...entity },
      metadata: {
        originalStore: entityType
      }
    };

    await localDb.put(STORES.TRASH, trashEntry);
    return trashEntry;
  }

  async restore(trashId) {
    const entry = await localDb.getById(STORES.TRASH, trashId);
    if (!entry) throw new Error(`Trash entry ${trashId} not found`);

    const { entityType, data, entityId } = entry;
    
    // Restore to original store
    await localDb.put(entityType, data);
    
    // Create restore snapshot
    await this.createSnapshot(entityType, data, 'restored');
    
    // Remove from trash
    await localDb.delete(STORES.TRASH, trashId);
    
    return data;
  }

  async permanentDelete(trashId) {
    await localDb.delete(STORES.TRASH, trashId);
  }
  
  async clearTrash() {
    await localDb.clear(STORES.TRASH);
  }
}

export const trashService = new TrashService();
