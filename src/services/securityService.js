import { localDb, STORES } from '../database/core/localDatabase';

/**
 * JARVIS Web Cryptography Service
 * Provides client-side PBKDF2 key derivation and AES-GCM encryption/decryption
 */
class SecurityService {
  /**
   * Helper to convert a string to an ArrayBuffer
   */
  _stringToBuffer(str) {
    return new TextEncoder().encode(str);
  }

  /**
   * Helper to convert an ArrayBuffer to a string
   */
  _bufferToString(buffer) {
    return new TextDecoder().decode(buffer);
  }

  /**
   * Helper to convert a byte array to Base64
   */
  _bufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Helper to convert Base64 to ArrayBuffer
   */
  _base64ToBuffer(base64) {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Derives a cryptographic key using PBKDF2 with SHA-256
   */
  async _deriveKey(password, saltBuffer) {
    const passwordBuffer = this._stringToBuffer(password);
    
    // Import raw password as key material
    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    // Derive key
    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: 100000,
        hash: 'SHA-256',
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypts plain text using a user-defined password
   */
  async encryptData(text, password) {
    try {
      if (!text) return '';
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      const key = await this._deriveKey(password, salt);
      const textBuffer = this._stringToBuffer(text);
      
      const ciphertextBuffer = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        textBuffer
      );

      // Package salt, iv, and ciphertext as a unified Base64 payload
      const payload = {
        salt: this._bufferToBase64(salt),
        iv: this._bufferToBase64(iv),
        ciphertext: this._bufferToBase64(ciphertextBuffer)
      };

      return JSON.stringify(payload);
    } catch (error) {
      console.error('[Security] Encryption failed:', error);
      throw new Error('Encryption cycle failed. Verify environment compatibility.');
    }
  }

  /**
   * Decrypts an encrypted payload using a user-defined password
   */
  async decryptData(payloadString, password) {
    try {
      if (!payloadString) return '';
      const payload = JSON.parse(payloadString);
      
      if (!payload.salt || !payload.iv || !payload.ciphertext) {
        throw new Error('Malformed encryption package.');
      }

      const salt = this._base64ToBuffer(payload.salt);
      const iv = this._base64ToBuffer(payload.iv);
      const ciphertext = this._base64ToBuffer(payload.ciphertext);
      
      const key = await this._deriveKey(password, new Uint8Array(salt));
      
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: new Uint8Array(iv)
        },
        key,
        ciphertext
      );

      return this._bufferToString(decryptedBuffer);
    } catch (error) {
      console.warn('[Security] Decryption failed. Incorrect passphrase or corrupted payload.');
      throw new Error('Decryption failed. Please check your password and try again.');
    }
  }

  /**
   * Verifies if a password matches the stored credentials by performing a decryption test
   */
  async verifyPassword(password) {
    try {
      const storedHandshake = localStorage.getItem('jarvis_vault_handshake');
      if (!storedHandshake) {
        // No password set yet
        return true;
      }
      const decrypted = await this.decryptData(storedHandshake, password);
      return decrypted === 'JARVIS_SECURE_VAULT';
    } catch {
      return false;
    }
  }

  /**
   * Establishes a new password by generating a validation handshake
   */
  async setPassword(password) {
    try {
      const handshake = await this.encryptData('JARVIS_SECURE_VAULT', password);
      localStorage.setItem('jarvis_vault_handshake', handshake);
      localStorage.setItem('jarvis_vault_active', 'true');
    } catch (error) {
      console.error('[Security] Failed to initialize password:', error);
      throw error;
    }
  }

  /**
   * Removes current password configurations and security lock
   */
  removePassword() {
    localStorage.removeItem('jarvis_vault_handshake');
    localStorage.removeItem('jarvis_vault_active');
  }

  /**
   * Compiles and encrypts all IndexedDB stores, exporting them as a secure file download
   */
  async exportEncryptedBackup(password) {
    try {
      const databasePayload = {};
      const storeNames = Object.values(STORES);
      
      console.log(`[Backup] Starting export for ${storeNames.length} database stores...`);
      
      // Batch fetch all records from IndexedDB
      await Promise.all(
        storeNames.map(async (storeName) => {
          const records = await localDb.getAll(storeName);
          databasePayload[storeName] = records || [];
        })
      );

      const backupPackage = {
        version: 1,
        exportedAt: new Date().toISOString(),
        userId: localDb.currentUserId || 'guest',
        data: databasePayload
      };

      const serializedBackup = JSON.stringify(backupPackage);
      const encryptedBackup = await this.encryptData(serializedBackup, password);

      // Generate secure file download
      const blob = new Blob([encryptedBackup], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const formattedDate = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `jarvis_encrypted_backup_${formattedDate}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('[Backup] Encrypted backup compiled, encrypted, and downloaded successfully.');
      return true;
    } catch (error) {
      console.error('[Backup] Full export cycle failed:', error);
      throw error;
    }
  }

  /**
   * Decrypts, validates, and populates IndexedDB with a backup file
   */
  async importEncryptedBackup(encryptedBackupString, password) {
    try {
      console.log('[Backup] Initiating restore cycle...');
      const decryptedString = await this.decryptData(encryptedBackupString, password);
      const parsedBackup = JSON.parse(decryptedString);

      if (!parsedBackup.data || typeof parsedBackup.data !== 'object') {
        throw new Error('Corrupted or invalid database backup payload.');
      }

      const storeNames = Object.values(STORES);
      const importedData = parsedBackup.data;
      
      // Perform structural transaction validation
      console.log('[Backup] Backup decrypted successfully. Wiping and restoring stores...');
      
      // Ingest and overwrite all valid stores sequentially
      for (const storeName of storeNames) {
        if (importedData[storeName]) {
          await localDb.clear(storeName);
          const records = importedData[storeName];
          if (records.length > 0) {
            await localDb.bulkPut(storeName, records);
          }
          console.log(`[Backup] Restored store: ${storeName} (${records.length} items)`);
        }
      }

      console.log('[Backup] All databases restored successfully. Triggering system reload.');
      return true;
    } catch (error) {
      console.error('[Backup] Ingestion of backup package failed:', error);
      throw error;
    }
  }
}

export const securityService = new SecurityService();
