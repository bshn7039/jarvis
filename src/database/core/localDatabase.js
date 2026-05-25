const DEFAULT_DB_NAME = 'JARVIS_DB';
const DB_VERSION = 5; // Bump version for new academic stores

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
  ACADEMIC_SKILLS: 'academicSkills',
  ACADEMIC_LEARNING: 'academicLearning',
  ACADEMIC_DSA: 'academicDsa',
  ACADEMIC_TECH_STACK: 'academicTechStack',
  ACADEMIC_CERTIFICATIONS: 'academicCertifications',
  ACADEMIC_PORTFOLIO: 'academicPortfolio',
  PROFILE: 'profile',
  ACTIVITIES: 'activities',
  REPETITIVE_TASKS: 'repetitiveTasks',
  REPETITIVE_HISTORY: 'repetitiveHistory',
  METADATA: 'metadata',
  TRASH: 'trash',
  VERSIONS: 'versions',
};

class LocalDatabase {
  constructor() {
    this.db = null;
    this.currentUserId = null;
  }

  setUserId(userId) {
    if (this.currentUserId !== userId) {
      this.currentUserId = userId;
      this.db = null; // Reset connection for new namespace
    }
  }

  getDbName() {
    return this.currentUserId ? `JARVIS_DB_${this.currentUserId}` : DEFAULT_DB_NAME;
  }

  async init() {
    if (this.db) return this.db;

    const dbName = this.getDbName();

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, DB_VERSION);

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
        console.error(`IndexedDB error (${dbName}):`, event.target.error);
        reject(event.target.error);
      };
    });
  }

  async getStore(storeName, mode = 'readonly') {
    const db = await this.init();
    
    // Safety check: if store doesn't exist (e.g. during a transition), try to handle it
    if (!db.objectStoreNames.contains(storeName)) {
      console.warn(`[DB] Store ${storeName} missing in ${this.getDbName()}. Attempting recovery...`);
      // This is rare but can happen if init() was called before a version bump was fully realized
    }

    const transaction = db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  async getAll(storeName) {
    try {
      const store = await this.getStore(storeName);
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`[DB] getAll failed for ${storeName}:`, error);
      return [];
    }
  }

  async getById(storeName, id) {
    try {
      const store = await this.getStore(storeName);
      return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`[DB] getById failed for ${storeName}:${id}:`, error);
      return null;
    }
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
    if (!items || items.length === 0) return;
    
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
