import { IndexedDbDatabase, STORES } from '../core/localDatabase';
import { firebaseDb } from './firebaseDatabase';
import { authService } from './authService';

class MigrationService {
  async migrateUserData(username, firebaseUserId) {
    try {
      firebaseDb.setUserId(firebaseUserId);
      
      // 1. Check if the user has already migrated to avoid redundant writes
      const migrationDoc = await firebaseDb.getById(STORES.METADATA, 'migration-status');
      if (migrationDoc && migrationDoc.migrated) {
        console.log(`[Migration] User '${username}' data already migrated to Firebase on ${migrationDoc.migratedAt}. Skipping.`);
        return;
      }

      console.log(`[Migration] Checking for legacy local IndexedDB database to migrate for username: ${username}`);
      
      // 2. Find the local user matching this username
      const localUser = await authService.findUserByIdentifier(username);
      if (!localUser || !localUser.userId) {
        console.log('[Migration] No local user database matching this username was found. Skipping migration.');
        return;
      }
      
      const localUserId = localUser.userId;
      console.log(`[Migration] Found local database with userId: ${localUserId}. Starting data migration to Firebase...`);
      
      // 3. Initialize a separate IndexedDB instance for the local user to read their offline data
      const localDbInstance = new IndexedDbDatabase();
      localDbInstance.setUserId(localUserId);
      await localDbInstance.init();
      
      // 4. Migrate all data stores
      const storesToMigrate = Object.values(STORES);
      
      for (const storeName of storesToMigrate) {
        // Skip metadata/versions/activities to avoid overriding system configs or cluttering
        if (storeName === STORES.VERSIONS || storeName === STORES.METADATA) {
          continue;
        }
        
        try {
          const items = await localDbInstance.getAll(storeName);
          if (items && items.length > 0) {
            console.log(`[Migration] Migrating ${items.length} items from local store '${storeName}' to Firestore...`);
            await firebaseDb.bulkPut(storeName, items);
          }
        } catch (storeError) {
          console.error(`[Migration] Failed to migrate store '${storeName}':`, storeError);
        }
      }
      
      // 5. Mark the migration as complete in Firestore
      await firebaseDb.put(STORES.METADATA, {
        id: 'migration-status',
        migrated: true,
        migratedAt: new Date().toISOString(),
        localUserId
      });
      
      console.log(`[Migration] Successfully completed data migration from IndexedDB to Firebase for user: ${username}`);
    } catch (error) {
      console.error('[Migration] Critical failure during user data migration:', error);
    }
  }
}

export const migrationService = new MigrationService();
