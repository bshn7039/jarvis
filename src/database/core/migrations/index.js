import { localDb, STORES } from '../localDatabase';

const MIGRATIONS = [
  {
    version: 1,
    description: 'Initial schema setup',
    run: async () => {
      // Handled by IndexedDB onupgradeneeded
    }
  },
  {
    version: 4, // Aligned with DB_VERSION
    description: 'Add metadata, trash, and version stores',
    run: async () => {
      // Handled by IndexedDB onupgradeneeded in localDatabase.js
      // But we can perform data patches here if needed
    }
  },
  {
    version: 8,
    description: 'Clean up Today schedule - Wake up at 8AM, Sleep at 12AM',
    run: async () => {
      console.log('[Migration] Cleaning up Today schedule in IndexedDB and localStorage...');
      try {
        const allTasks = await localDb.getAll(STORES.TASKS);
        const todayTasks = allTasks.filter(t => t.bucket === 'today');
        console.log(`[Migration] Deleting ${todayTasks.length} existing today tasks...`);
        for (const t of todayTasks) {
          await localDb.delete(STORES.TASKS, t.id);
        }
        
        const now = new Date().toISOString();
        const wakeupTask = {
          id: `task-wakeup-${Date.now()}`,
          title: 'Wake up, hydrate (500ml water)',
          description: 'Start the day and rehydrate.',
          bucket: 'today',
          time: '08:00',
          priority: 'medium',
          category: 'Routines',
          completed: false,
          progress: 0,
          createdAt: now,
          updatedAt: now
        };
        
        const sleepTask = {
          id: `task-sleep-${Date.now()}`,
          title: 'Bedtime',
          description: 'Wind down and go to sleep.',
          bucket: 'today',
          time: '23:59',
          priority: 'medium',
          category: 'Routines',
          completed: false,
          progress: 0,
          createdAt: now,
          updatedAt: now
        };
        
        await localDb.put(STORES.TASKS, wakeupTask);
        await localDb.put(STORES.TASKS, sleepTask);

        // Clear local storage daily schedule and brief so they regenerate cleanly
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem('jarvis_daily_schedule');
          window.localStorage.removeItem('jarvis_daily_brief');
          window.localStorage.removeItem('jarvis_last_generated_date');
          console.log('[Migration] Cleared localStorage daily cache.');
        }
        
        console.log('[Migration] Successfully initialized clean daily rhythm schedule.');
      } catch (err) {
        console.error('[Migration] Failed to execute v8 migration:', err);
        throw err;
      }
    }
  },
  {
    version: 9,
    description: 'Clean routine tasks from IndexedDB tasks list and initialize clean Today Schedule in localStorage',
    run: async () => {
      console.log('[Migration] Cleaning up routine tasks from IndexedDB...');
      try {
        const allTasks = await localDb.getAll(STORES.TASKS);
        
        const routineTasksToDelete = allTasks.filter(t => 
          t.id.startsWith('task-wakeup') || 
          t.id.startsWith('task-sleep') ||
          t.title.includes('Wake up, hydrate') ||
          t.title.includes('Bedtime')
        );
        
        console.log(`[Migration] Deleting ${routineTasksToDelete.length} routine tasks from IndexedDB tasks...`);
        for (const t of routineTasksToDelete) {
          await localDb.delete(STORES.TASKS, t.id);
        }

        if (typeof window !== 'undefined' && window.localStorage) {
          const cleanSchedule = [
            { id: 'sched-wakeup', time: '08:00', label: 'Wake up', category: 'Routines', status: 'upcoming' },
            { id: 'sched-sleep', time: '00:00', label: 'Sleep', category: 'Routines', status: 'upcoming' }
          ];
          window.localStorage.setItem('jarvis_daily_schedule', JSON.stringify(cleanSchedule));
          
          const cleanBrief = {
            primary: 'Review daily objectives and maintain system discipline.',
            secondary: 'Wake up at 8:00 AM and Sleep at 12:00 AM as your daily rhythm.',
            watchOuts: 'Keep monitoring your daily schedules and routines.'
          };
          window.localStorage.setItem('jarvis_daily_brief', JSON.stringify(cleanBrief));
          window.localStorage.setItem('jarvis_last_generated_date', new Date().toISOString().slice(0, 10));
          console.log('[Migration] Successfully seeded clean schedule and brief directly to localStorage.');
        }
      } catch (err) {
        console.error('[Migration] Failed to execute v9 migration:', err);
        throw err;
      }
    }
  }
];

export async function runMigrations() {
  const metadata = await localDb.getById(STORES.METADATA, 'db-version') || { id: 'db-version', version: 0 };
  const currentVersion = metadata.version;

  console.log(`[DB] Migration: Current version is ${currentVersion}`);

  const pendingMigrations = MIGRATIONS.filter(m => m.version > currentVersion).sort((a, b) => a.version - b.version);

  if (pendingMigrations.length === 0) {
    console.log('[DB] Migration: No pending migrations.');
    return;
  }

  for (const migration of pendingMigrations) {
    console.log(`[DB] Migration: Running v${migration.version} - ${migration.description}...`);
    try {
      await migration.run();
      await localDb.put(STORES.METADATA, { id: 'db-version', version: migration.version, migratedAt: new Date().toISOString() });
      console.log(`[DB] Migration: v${migration.version} completed.`);
    } catch (error) {
      console.error(`[DB] Migration: v${migration.version} failed:`, error);
      throw error;
    }
  }

  console.log('[DB] Migration: All migrations completed successfully.');
}
