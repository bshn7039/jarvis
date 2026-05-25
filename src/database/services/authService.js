const SYSTEM_DB_NAME = 'JARVIS_SYSTEM';
const USERS_STORE = 'users';

class AuthService {
  constructor() {
    this.db = null;
  }

  async initDb() {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(SYSTEM_DB_NAME, 1);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(USERS_STORE)) {
          db.createObjectStore(USERS_STORE, { keyPath: 'username' });
        }
      };
      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async getUsers() {
    const db = await this.initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(USERS_STORE, 'readonly');
      const store = transaction.objectStore(USERS_STORE);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async hasUsers() {
    const users = await this.getUsers();
    return users.length > 0;
  }

  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async register(username, password) {
    const db = await this.initDb();
    const passwordHash = await this.hashPassword(password);
    const userId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const user = {
      username,
      passwordHash,
      userId,
      createdAt: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(USERS_STORE, 'readwrite');
      const store = transaction.objectStore(USERS_STORE);
      const request = store.put(user);
      request.onsuccess = () => resolve(user);
      request.onerror = () => reject(request.error);
    });
  }

  async login(username, password) {
    const db = await this.initDb();
    const passwordHash = await this.hashPassword(password);
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(USERS_STORE, 'readonly');
      const store = transaction.objectStore(USERS_STORE);
      const request = store.get(username);
      request.onsuccess = () => {
        const user = request.result;
        if (user && user.passwordHash === passwordHash) {
          resolve(user);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const authService = new AuthService();
