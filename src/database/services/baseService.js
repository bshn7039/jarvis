import { localDb } from '../core/localDatabase';
import { trashService } from './trashService';

export class BaseService {
  constructor(storeName) {
    this.storeName = storeName;
  }

  async getAll() {
    return localDb.getAll(this.storeName);
  }

  async getById(id) {
    return localDb.getById(this.storeName, id);
  }

  async create(data) {
    const id =
      data.id ||
      `${this.storeName.slice(0, 3)}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newItem = await localDb.put(this.storeName, { ...data, id });
    
    // Auto-snapshot on creation
    await trashService.createSnapshot(this.storeName, newItem, 'created');
    
    return newItem;
  }

  async update(id, data) {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`${this.storeName} with id ${id} not found`);
    
    // BEFORE overwriting entity: create snapshot of previous state
    await trashService.createSnapshot(this.storeName, existing, 'modified');
    
    const updated = await localDb.put(this.storeName, { ...existing, ...data });
    return updated;
  }

  async delete(id) {
    const existing = await this.getById(id);
    if (existing) {
      // Move full entity snapshot into trash archive
      await trashService.moveToTrash(this.storeName, existing);
    }
    return localDb.delete(this.storeName, id);
  }

  async bulkUpdate(items) {
    // For bulk updates, we might want to be careful with snapshots to avoid perf hits
    // but for now, let's keep it simple. If it's a small number of items, it's fine.
    return localDb.bulkPut(this.storeName, items);
  }
}
