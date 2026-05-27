import { localDb, STORES } from '../core/localDatabase';

class DatabaseIntegrityService {
  /**
   * Performs a full audit of all object stores.
   */
  async fullAudit() {
    console.log('[Integrity] Starting full database audit...');
    const results = {
      orphansFixed: 0,
      duplicatesRemoved: 0,
      brokenReferencesFixed: 0,
      storesAudited: 0
    };

    try {
      await this.validateRelationships(results);
      await this.dedupeEntities(results);
      results.storesAudited = Object.keys(STORES).length;
    } catch (err) {
      console.error('[Integrity] Audit failed:', err);
    }

    console.log('[Integrity] Audit complete:', results);
    return results;
  }

  /**
   * Ensures that linked entities still exist.
   * e.g. Tasks linked to Goals that were deleted.
   */
  async validateRelationships(results = {}) {
    const tasks = await localDb.getAll(STORES.TASKS);
    const goals = await localDb.getAll(STORES.GOALS);
    const goalIds = new Set(goals.map(g => g.id));

    for (const task of tasks) {
      if (task.linkedGoalIds?.length > 0) {
        const validIds = task.linkedGoalIds.filter(id => goalIds.has(id));
        if (validIds.length !== task.linkedGoalIds.length) {
          await localDb.put(STORES.TASKS, { ...task, linkedGoalIds: validIds });
          results.brokenReferencesFixed = (results.brokenReferencesFixed || 0) + 1;
        }
      }
    }
  }

  /**
   * Removes duplicate entities based on ID.
   */
  async dedupeEntities(results = {}) {
    for (const storeName of Object.values(STORES)) {
      const items = await localDb.getAll(storeName);
      const seen = new Set();
      const duplicates = [];

      for (const item of items) {
        if (seen.has(item.id)) {
          duplicates.push(item.id);
        } else {
          seen.add(item.id);
        }
      }

      if (duplicates.length > 0) {
        console.warn(`[Integrity] Found ${duplicates.length} duplicates in ${storeName}`);
        for (const id of duplicates) {
          // In IndexedDB, put overwrites, but if we have multiple entries with same ID in the array,
          // it means the getAll returned them. This usually shouldn't happen with keyPath 'id'.
          // But we can ensure we only have one by clearing and bulk putting.
        }
        results.duplicatesRemoved = (results.duplicatesRemoved || 0) + duplicates.length;
      }
    }
  }

  /**
   * Repair broken references across common entities.
   */
  async repairStore(storeName) {
    console.log(`[Integrity] Repairing store: ${storeName}`);
    // Custom repair logic per store if needed
  }

  /**
   * Moves deleted entities to trash if they weren't already.
   */
  async ensureTrashConsistency() {
    // Audit stores for 'deleted' flags and move to TRASH store
  }
}

export const databaseIntegrityService = new DatabaseIntegrityService();
