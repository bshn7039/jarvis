import { localDb, STORES } from './localDatabase';
import { seedData } from '../seed/initialSeed';

export async function bootstrapDatabase() {
  try {
    const db = await localDb.init();
    
    // Simple check: if tasks store is empty, assume first launch
    const existingTasks = await localDb.getAll(STORES.TASKS);
    
    if (existingTasks.length === 0) {
      console.log('[DB] Bootstrap: Initializing IndexedDB with seed data...');
      
      await Promise.all([
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
      ]);
      
      console.log('[DB] Bootstrap: Database initialization complete.');
    } else {
      console.log('[DB] Bootstrap: Database already exists, skipping seed.');
    }
  } catch (error) {
    console.error('[DB] Bootstrap: Failed to initialize database:', error);
    throw error; // Re-throw to be caught by main.jsx
  }
}
