import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  writeBatch
} from 'firebase/firestore';

// Your Web App's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDJUgd9cGC5V7jC9dxCEIoG7fEr0qQWPgc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "jarvis-4b42c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "jarvis-4b42c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "jarvis-4b42c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "590227528322",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:590227528322:web:e7dd044f13fdd38c8eb29b",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-ZGKB1TH31T"
};

class FirebaseDatabase {
  constructor() {
    this.app = null;
    this.db = null;
    this.currentUserId = null;
  }

  setUserId(userId) {
    if (this.currentUserId !== userId) {
      console.log(`[FirebaseDB] Switched user context to: ${userId}`);
      this.currentUserId = userId;
    }
  }

  init() {
    if (!this.db) {
      this.app = initializeApp(firebaseConfig);
      this.db = getFirestore(this.app);
      console.log('[FirebaseDB] Initialized Firestore client successfully.');
    }
    return this.db;
  }

  getUserSubcollectionRef(storeName) {
    this.init();
    if (!this.currentUserId) {
      throw new Error('[FirebaseDB] Access denied: setUserId(userId) must be called before querying.');
    }
    return collection(this.db, 'users', this.currentUserId, storeName);
  }

  async getAll(storeName) {
    try {
      const colRef = this.getUserSubcollectionRef(storeName);
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error(`[FirebaseDB] getAll failed for ${storeName}:`, error);
      return [];
    }
  }

  async getById(storeName, id) {
    if (!id) return null;
    try {
      const colRef = this.getUserSubcollectionRef(storeName);
      const docRef = doc(colRef, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error(`[FirebaseDB] getById failed for ${storeName}:${id}:`, error);
      return null;
    }
  }

  async put(storeName, data) {
    try {
      const colRef = this.getUserSubcollectionRef(storeName);
      const id = data.id || doc(colRef).id;
      const item = {
        ...data,
        id,
        updatedAt: new Date().toISOString(),
        createdAt: data.createdAt || new Date().toISOString(),
      };
      
      const docRef = doc(colRef, id);
      await setDoc(docRef, item);
      return item;
    } catch (error) {
      console.error(`[FirebaseDB] put failed for ${storeName}:`, error);
      throw error;
    }
  }

  async delete(storeName, id) {
    if (!id) return;
    try {
      const colRef = this.getUserSubcollectionRef(storeName);
      const docRef = doc(colRef, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`[FirebaseDB] delete failed for ${storeName}:${id}:`, error);
      throw error;
    }
  }

  async clear(storeName) {
    try {
      const colRef = this.getUserSubcollectionRef(storeName);
      const snapshot = await getDocs(colRef);
      if (snapshot.empty) return;

      const batch = writeBatch(this.db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    } catch (error) {
      console.error(`[FirebaseDB] clear failed for ${storeName}:`, error);
      throw error;
    }
  }

  async bulkPut(storeName, items) {
    if (!items || items.length === 0) return;
    
    this.init();
    const colRef = this.getUserSubcollectionRef(storeName);
    
    // Firestore batch has a limit of 500 operations. We split larger sets into chunks of 400.
    const CHUNK_SIZE = 400;
    for (let i = 0; i < items.length; i += CHUNK_SIZE) {
      const chunk = items.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(this.db);
      
      chunk.forEach((item) => {
        const id = item.id || doc(colRef).id;
        const enrichedItem = {
          ...item,
          id,
          updatedAt: new Date().toISOString(),
          createdAt: item.createdAt || new Date().toISOString(),
        };
        const docRef = doc(colRef, id);
        batch.set(docRef, enrichedItem);
      });
      
      await batch.commit();
    }
  }
}

export const firebaseDb = new FirebaseDatabase();
