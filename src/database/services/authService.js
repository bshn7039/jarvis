const SYSTEM_DB_NAME = 'JARVIS_SYSTEM';
const USERS_STORE = 'users';

class AuthService {
  constructor() {
    this.db = null;
  }

  async initDb() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      // Version 2 adds email index + salted hashing support
      const request = indexedDB.open(SYSTEM_DB_NAME, 2);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        let store;

        if (!db.objectStoreNames.contains(USERS_STORE)) {
          store = db.createObjectStore(USERS_STORE, { keyPath: 'username' });
        } else {
          store = event.target.transaction.objectStore(USERS_STORE);
        }

        if (!store.indexNames.contains('email')) {
          store.createIndex('email', 'email', { unique: true });
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

  async generateSalt() {
    const saltBytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(saltBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async hashPassword(password, saltHex) {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${saltHex}:${password}`);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async findUserByIdentifier(identifier) {
    const db = await this.initDb();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(USERS_STORE, 'readonly');
      const store = tx.objectStore(USERS_STORE);

      // First try username (primary key)
      const byUsernameRequest = store.get(identifier);

      byUsernameRequest.onsuccess = () => {
        const user = byUsernameRequest.result;
        if (user) {
          resolve(user);
        } else {
          // Fallback to email index
          let emailIndex;
          try {
            emailIndex = store.index('email');
          } catch {
            resolve(null);
            return;
          }
          const byEmailRequest = emailIndex.get(identifier);
          byEmailRequest.onsuccess = () => resolve(byEmailRequest.result || null);
          byEmailRequest.onerror = () => reject(byEmailRequest.error);
        }
      };

      byUsernameRequest.onerror = () => reject(byUsernameRequest.error);
    });
  }

  async register(username, email, password) {
    const db = await this.initDb();

    // Prevent duplicate username
    const existingByUsername = await new Promise((resolve, reject) => {
      const tx = db.transaction(USERS_STORE, 'readonly');
      const store = tx.objectStore(USERS_STORE);
      const req = store.get(username);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });

    if (existingByUsername) {
      throw new Error('Username already exists');
    }

    // Prevent duplicate email
    const existingByEmail = await new Promise((resolve, reject) => {
      const tx = db.transaction(USERS_STORE, 'readonly');
      const store = tx.objectStore(USERS_STORE);
      let emailIndex;
      try {
        emailIndex = store.index('email');
      } catch {
        resolve(null);
        return;
      }
      const req = emailIndex.get(email);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });

    if (existingByEmail) {
      throw new Error('Email already exists');
    }

    const salt = await this.generateSalt();
    const passwordHash = await this.hashPassword(password, salt);
    const userId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const user = {
      username,
      email,
      passwordHash,
      salt,
      userId,
      createdAt: now,
      updatedAt: now,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(USERS_STORE, 'readwrite');
      const store = transaction.objectStore(USERS_STORE);
      const request = store.put(user);
      request.onsuccess = () => resolve(user);
      request.onerror = () => reject(request.error);
    });
  }

  async login(identifier, password) {
    const user = await this.findUserByIdentifier(identifier);
    if (!user) return null;

    const { salt, passwordHash } = user;
    if (!salt || !passwordHash) {
      // Legacy / invalid user entry - do not authenticate
      return null;
    }

    const computedHash = await this.hashPassword(password, salt);
    if (computedHash !== passwordHash) {
      return null;
    }

    return user;
  }
}

export const authService = new AuthService();
