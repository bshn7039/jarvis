const DB_NAME = 'JARVIS_DB';
const DB_VERSION = 2;

export const STORES = {
  TASKS: 'tasks',
  GOALS: 'goals',
  JOURNAL_ENTRIES: 'journalEntries',
  FINANCE_TRANSACTIONS: 'financeTransactions',
  FITNESS_LOGS: 'fitnessLogs',
  CRM_CONTACTS: 'crmContacts',
  ACADEMIC_SUBJECTS: 'academicSubjects',
  ACADEMIC_ASSIGNMENTS: 'academicAssignments',
  ACADEMIC_PRACTICALS: 'academicPracticals',
  ACADEMIC_REVISION_LOGS: 'academicRevisionLogs',
  SCHEDULES: 'schedules',
  METRICS_SNAPSHOTS: 'metricsSnapshots',
  PERSONAL: 'personal',
  CANVAS: 'canvas',
  CHATS: 'chats',
  SAVINGS_GOALS: 'savingsGoals',
  FITNESS_ROUTINES: 'fitnessRoutines',
  CRM_REMINDERS: 'crmReminders',
  CRM_INTERACTIONS: 'crmInteractions',
  ACADEMIC_PROJECTS: 'academicProjects',
  ACADEMIC_META: 'academicMeta',
  PROFILE: 'profile',
  ACTIVITIES: 'activities',
};

class LocalDatabase {
  constructor() {
    this.db = null;
  }

  async init() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores
        Object.values(STORES).forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        });
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async getStore(storeName, mode = 'readonly') {
    const db = await this.init();
    const transaction = db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  async getAll(storeName) {
    const store = await this.getStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getById(storeName, id) {
    const store = await this.getStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put(storeName, data) {
    const store = await this.getStore(storeName, 'readwrite');
    const item = {
      ...data,
      updatedAt: new Date().toISOString(),
      createdAt: data.createdAt || new Date().toISOString(),
    };
    return new Promise((resolve, reject) => {
      const request = store.put(item);
      request.onsuccess = () => resolve(item);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, id) {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName) {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async bulkPut(storeName, items) {
    const db = await this.init();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      items.forEach((item) => {
        const enrichedItem = {
          ...item,
          updatedAt: new Date().toISOString(),
          createdAt: item.createdAt || new Date().toISOString(),
        };
        store.put(enrichedItem);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

export const localDb = new LocalDatabase();
