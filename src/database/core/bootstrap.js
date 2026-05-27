import { localDb, STORES } from './localDatabase';
import { seedData } from '../seed/initialSeed';
import { runMigrations } from './migrations';

export async function bootstrapDatabase(userId = null) {
  try {
    if (userId) {
      localDb.setUserId(userId);
    }
    
    await localDb.init();
    
    // 1. Run Migrations
    await runMigrations();

    // 2. Metadata check
    const metadata = await localDb.getById(STORES.METADATA, 'app-status') || { id: 'app-status', initialized: false };
    
    if (!metadata.initialized) {
      console.log('[DB] Bootstrap: Initializing first launch seed data...');
      
      const seedPromises = [
        localDb.bulkPut(STORES.TASKS, seedData.tasks || []),
        localDb.bulkPut(STORES.GOALS, seedData.goals || []),
        localDb.bulkPut(STORES.JOURNAL_ENTRIES, seedData.journalEntries || []),
        localDb.bulkPut(STORES.FINANCE_TRANSACTIONS, seedData.financeTransactions || []),
        localDb.bulkPut(STORES.FITNESS_LOGS, seedData.fitnessLogs || []),
        localDb.bulkPut(STORES.CRM_CONTACTS, seedData.crmContacts || []),
        localDb.bulkPut(STORES.ACADEMIC_SUBJECTS, seedData.academicSubjects || []),
        localDb.bulkPut(STORES.ACADEMIC_ASSIGNMENTS, seedData.academicAssignments || []),
        localDb.bulkPut(STORES.ACADEMIC_PRACTICALS, seedData.academicPracticals || []),
        localDb.bulkPut(STORES.ACADEMIC_REVISION_LOGS, seedData.academicRevisionLogs || []),
        localDb.bulkPut(STORES.SCHEDULES, seedData.schedules || []),
        localDb.bulkPut(STORES.METRICS_SNAPSHOTS, seedData.metricsSnapshots || []),
        localDb.bulkPut(STORES.PERSONAL, [ 
          { id: 'user-profile', ...(seedData.personal?.profile || {}) }, 
          { id: 'user-preferences', ...(seedData.personal?.preferences || {}) } 
        ]),
        localDb.bulkPut(STORES.CANVAS, seedData.canvas || []),
        localDb.bulkPut(STORES.CHATS, seedData.chats || []),
        localDb.bulkPut(STORES.PROFILE, seedData.profile || []),
        localDb.bulkPut(STORES.SAVINGS_GOALS, seedData.savingsGoals || []),
        localDb.bulkPut(STORES.FITNESS_ROUTINES, seedData.fitnessRoutines || []),
        localDb.bulkPut(STORES.CRM_REMINDERS, seedData.crmReminders || []),
        localDb.bulkPut(STORES.CRM_INTERACTIONS, seedData.crmInteractions || []),
        localDb.bulkPut(STORES.ACADEMIC_PROJECTS, seedData.academicProjects || []),
        localDb.bulkPut(STORES.ACADEMIC_META, seedData.academicMeta || [])
      ];
      
      await Promise.all(seedPromises);
      
      await localDb.put(STORES.METADATA, { 
        id: 'app-status', 
        initialized: true, 
        userId: userId || 'default',
        createdAt: new Date().toISOString() 
      });
      
      console.log('[DB] Bootstrap: Initialization complete.');
    } else {
      console.log('[DB] Bootstrap: User data already exists, skipping seed.');
    }
  } catch (error) {
    console.error('[DB] Bootstrap: Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Wipes the entire IndexedDB and resets the in-memory connection.
 * Call this from DevTools console or a dev reset button:
 *   import { resetDatabase } from './database/core/bootstrap';
 *   await resetDatabase(); location.reload();
 */
export async function resetDatabase(userId = null) {
  const dbName = userId ? `JARVIS_DB_${userId}` : 'JARVIS_DB';
  console.log(`[DB] Resetting database: ${dbName}`);
  
  // Close existing connection
  if (localDb.db) {
    localDb.db.close();
    localDb.db = null;
  }

  return new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase(dbName);
    req.onsuccess = () => {
      console.log('[DB] Database deleted. Reload the page to re-initialize with clean seed data.');
      resolve();
    };
    req.onerror = () => reject(req.error);
    req.onblocked = () => {
      console.warn('[DB] Database deletion blocked. Close all other tabs and retry.');
    };
  });
}
