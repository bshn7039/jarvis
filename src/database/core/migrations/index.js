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
