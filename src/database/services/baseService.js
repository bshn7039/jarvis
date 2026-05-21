import { localDb } from '../core/localDatabase';

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
    const id = data.id || `${this.storeName.slice(0, 3)}-${Date.now()}`;
    return localDb.put(this.storeName, { ...data, id });
  }

  async update(id, data) {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`${this.storeName} with id ${id} not found`);
    return localDb.put(this.storeName, { ...existing, ...data });
  }

  async delete(id) {
    return localDb.delete(this.storeName, id);
  }

  async bulkUpdate(items) {
    return localDb.bulkPut(this.storeName, items);
  }
}
