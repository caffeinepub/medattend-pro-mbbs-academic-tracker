// IndexedDB wrapper with robust initialization handling for blocked/upgrade scenarios

import type { ClassLog, TimetableEntry, Settings } from './models';

const DB_NAME = 'medattend_pro';
const DB_VERSION = 2; // Bumped for migration

const STORES = {
  CLASS_LOGS: 'classLogs',
  TIMETABLE: 'timetable',
  SETTINGS: 'settings',
};

let dbInstance: IDBDatabase | null = null;
let initPromise: Promise<IDBDatabase> | null = null;

export async function initDB(): Promise<IDBDatabase> {
  // Return existing instance if available
  if (dbInstance && dbInstance.objectStoreNames.length > 0) {
    return dbInstance;
  }

  // Return existing initialization promise to prevent multiple concurrent inits
  if (initPromise) {
    return initPromise;
  }

  initPromise = new Promise((resolve, reject) => {
    let resolved = false;
    
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB open error:', request.error);
      initPromise = null;
      if (!resolved) {
        resolved = true;
        reject(new Error(`Failed to open database: ${request.error?.message || 'Unknown error'}`));
      }
    };

    request.onblocked = () => {
      console.warn('IndexedDB open blocked - another connection is preventing upgrade');
      initPromise = null;
      if (!resolved) {
        resolved = true;
        reject(new Error('Database upgrade blocked. Please close other tabs with this app and try again.'));
      }
    };

    request.onsuccess = () => {
      if (resolved) return;
      
      dbInstance = request.result;

      // Handle version change from another tab
      dbInstance.onversionchange = () => {
        console.warn('Database version changed by another tab, closing connection');
        dbInstance?.close();
        dbInstance = null;
        initPromise = null;
      };

      // Handle unexpected close
      dbInstance.onclose = () => {
        console.warn('Database connection closed unexpectedly');
        dbInstance = null;
        initPromise = null;
      };

      resolved = true;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      try {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = (event.target as IDBOpenDBRequest).transaction!;
        const oldVersion = event.oldVersion;

        console.log(`Upgrading database from version ${oldVersion} to ${DB_VERSION}`);

        // Class logs store
        if (!db.objectStoreNames.contains(STORES.CLASS_LOGS)) {
          const classLogsStore = db.createObjectStore(STORES.CLASS_LOGS, { keyPath: 'id' });
          classLogsStore.createIndex('subject', 'subject', { unique: false });
          classLogsStore.createIndex('date', 'date', { unique: false });
          classLogsStore.createIndex('type', 'type', { unique: false });
        }

        // Timetable store
        if (!db.objectStoreNames.contains(STORES.TIMETABLE)) {
          const timetableStore = db.createObjectStore(STORES.TIMETABLE, { keyPath: 'id' });
          timetableStore.createIndex('dayOfWeek', 'dayOfWeek', { unique: false });
        }

        // Settings store
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }

        // Migration from v1 to v2: Convert attended/conducted to per-class records
        if (oldVersion < 2 && oldVersion > 0) {
          const classLogsStore = transaction.objectStore(STORES.CLASS_LOGS);
          const getAllRequest = classLogsStore.getAll();

          getAllRequest.onsuccess = () => {
            const oldLogs = getAllRequest.result as any[];
            console.log(`Migrating ${oldLogs.length} class logs to new schema`);

            oldLogs.forEach((log: any) => {
              // If log has old schema (attended/conducted), migrate it
              if ('attended' in log || 'conducted' in log) {
                const migratedLog = {
                  ...log,
                  attendanceStatus: log.attended ? 'Present' : 'Not Marked',
                };
                // Remove old fields
                delete migratedLog.attended;
                delete migratedLog.conducted;
                
                classLogsStore.put(migratedLog);
              }
            });
          };

          getAllRequest.onerror = () => {
            console.error('Migration failed:', getAllRequest.error);
          };
        }
      } catch (error) {
        console.error('Error during database upgrade:', error);
        initPromise = null;
        if (!resolved) {
          resolved = true;
          reject(error);
        }
      }
    };
  });

  return initPromise;
}

// Helper to get database instance
async function getDB(): Promise<IDBDatabase> {
  if (!dbInstance) {
    return await initDB();
  }
  return dbInstance;
}

// Class Logs operations
export async function addClassLog(log: Omit<ClassLog, 'id'>): Promise<string> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CLASS_LOGS], 'readwrite');
    const store = transaction.objectStore(STORES.CLASS_LOGS);
    const id = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const request = store.add({ ...log, id });

    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
}

export async function addMultipleClassLogs(logs: Omit<ClassLog, 'id'>[]): Promise<string[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CLASS_LOGS], 'readwrite');
    const store = transaction.objectStore(STORES.CLASS_LOGS);
    const ids: string[] = [];

    let completed = 0;
    let hasError = false;

    logs.forEach((log) => {
      const id = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      ids.push(id);
      const request = store.add({ ...log, id });

      request.onsuccess = () => {
        completed++;
        if (completed === logs.length && !hasError) {
          resolve(ids);
        }
      };

      request.onerror = () => {
        if (!hasError) {
          hasError = true;
          reject(request.error);
        }
      };
    });

    if (logs.length === 0) {
      resolve([]);
    }
  });
}

export async function getAllClassLogs(): Promise<ClassLog[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CLASS_LOGS], 'readonly');
    const store = transaction.objectStore(STORES.CLASS_LOGS);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function updateClassLog(id: string, updates: Partial<ClassLog>): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CLASS_LOGS], 'readwrite');
    const store = transaction.objectStore(STORES.CLASS_LOGS);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const log = getRequest.result;
      if (!log) {
        reject(new Error('Log not found'));
        return;
      }
      const updatedLog = { ...log, ...updates };
      const putRequest = store.put(updatedLog);
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
}

export async function deleteClassLog(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CLASS_LOGS], 'readwrite');
    const store = transaction.objectStore(STORES.CLASS_LOGS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Timetable operations
export async function addTimetableEntry(entry: Omit<TimetableEntry, 'id'>): Promise<string> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.TIMETABLE], 'readwrite');
    const store = transaction.objectStore(STORES.TIMETABLE);
    const id = `tt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const request = store.add({ ...entry, id });

    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllTimetableEntries(): Promise<TimetableEntry[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.TIMETABLE], 'readonly');
    const store = transaction.objectStore(STORES.TIMETABLE);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function updateTimetableEntry(id: string, updates: Partial<TimetableEntry>): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.TIMETABLE], 'readwrite');
    const store = transaction.objectStore(STORES.TIMETABLE);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const entry = getRequest.result;
      if (!entry) {
        reject(new Error('Entry not found'));
        return;
      }
      const updatedEntry = { ...entry, ...updates };
      const putRequest = store.put(updatedEntry);
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
}

export async function deleteTimetableEntry(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.TIMETABLE], 'readwrite');
    const store = transaction.objectStore(STORES.TIMETABLE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Settings operations
const SETTINGS_KEY = 'app_settings';

export async function getSetting<T>(key: string): Promise<T | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SETTINGS], 'readonly');
    const store = transaction.objectStore(STORES.SETTINGS);
    const request = store.get(key);

    request.onsuccess = () => {
      const result = request.result;
      resolve(result ? result.value : null);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SETTINGS], 'readwrite');
    const store = transaction.objectStore(STORES.SETTINGS);
    const request = store.put({ key, value });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Convenience functions for Settings object
export async function getSettings(): Promise<Settings | null> {
  return getSetting<Settings>(SETTINGS_KEY);
}

export async function saveSettings(settings: Settings): Promise<void> {
  return setSetting(SETTINGS_KEY, settings);
}
