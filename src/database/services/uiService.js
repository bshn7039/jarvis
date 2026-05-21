import { localDb, STORES } from '../core/localDatabase';

class UiService {
  async getSettings() {
    const all = await localDb.getAll(STORES.PERSONAL);
    return all.reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {});
  }

  async saveSetting(id, data) {
    return localDb.put(STORES.PERSONAL, { id, ...data });
  }

  async getCanvasRegistry() {
    return localDb.getAll(STORES.CANVAS);
  }

  async saveCanvasModule(module) {
    return localDb.put(STORES.CANVAS, module);
  }
  
  async getCommandCenterState() {
    // We could use a dedicated store or just PERSONAL
    return localDb.getById(STORES.PERSONAL, 'command-center-state');
  }

  async saveCommandCenterState(state) {
    return localDb.put(STORES.PERSONAL, { id: 'command-center-state', ...state });
  }
}

export const uiService = new UiService();
