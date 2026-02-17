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

export async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB open error:', request.error);
      reject(new Error(`Failed to open database: ${request.error?.message || 'Unknown error'}`));
    };

    request.onblocked = () => {
      console.warn('IndexedDB open blocked - another connection is preventing upgrade');
      reject(new Error('Database upgrade blocked. Please close other tabs with this app and try again.'));
    };

    request.onsuccess = () => {
      dbInstance = request.result;

      // Handle version change from another tab
      dbInstance.onversionchange = () => {
        console.warn('Database version changed by another tab, closing connection');
        dbInstance?.close();
        dbInstance = null;
      };

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
        if (oldVersion < 2) {
          const classLogsStore = transaction.objectStore(STORES.CLASS_LOGS);
          const getAllRequest = classLogsStore.getAll();

          getAllRequest.onsuccess = () => {
            const oldLogs = getAllRequest.result as any[];
            const newLogs: ClassLog[] = [];

            oldLogs.forEach((oldLog) => {
              // If already has attendanceStatus, skip
              if (oldLog.attendanceStatus) {
                newLogs.push(oldLog);
                return;
              }

              const conducted = oldLog.conducted || 1;
              const attended = oldLog.attended || 0;

              // Create individual class records based on conducted count
              for (let i = 0; i < conducted; i++) {
                const isPresent = i < attended;
                newLogs.push({
                  id: i === 0 ? oldLog.id : `${oldLog.id}-${i}`,
                  subject: oldLog.subject,
                  type: oldLog.type,
                  date: oldLog.date,
                  topic: oldLog.topic,
                  attendanceStatus: isPresent ? 'Present' : 'Absent',
                  source: oldLog.source || 'manual',
                  createdAt: oldLog.createdAt,
                  startTime: oldLog.startTime,
                  endTime: oldLog.endTime,
                  timetableEntryId: oldLog.timetableEntryId,
                });
              }
            });

            // Clear old data
            const clearRequest = classLogsStore.clear();
            clearRequest.onsuccess = () => {
              // Add migrated data
              newLogs.forEach((log) => {
                classLogsStore.add(log);
              });
              console.log(`Migrated ${newLogs.length} class log records`);
            };
            clearRequest.onerror = () => {
              console.error('Migration clear error:', clearRequest.error);
            };
          };

          getAllRequest.onerror = () => {
            console.error('Migration getAll error:', getAllRequest.error);
          };
        }
      } catch (error) {
        console.error('IndexedDB upgrade error:', error);
        reject(new Error(`Database upgrade failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
  });
}

export async function getAllClassLogs(): Promise<ClassLog[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.CLASS_LOGS, 'readonly');
    const store = transaction.objectStore(STORES.CLASS_LOGS);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function addClassLog(log: ClassLog): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.CLASS_LOGS, 'readwrite');
    const store = transaction.objectStore(STORES.CLASS_LOGS);
    const request = store.add(log);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function addMultipleClassLogs(logs: ClassLog[]): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.CLASS_LOGS, 'readwrite');
    const store = transaction.objectStore(STORES.CLASS_LOGS);
    
    let completed = 0;
    const total = logs.length;
    
    logs.forEach((log) => {
      const request = store.add(log);
      request.onsuccess = () => {
        completed++;
        if (completed === total) {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  });
}

export async function updateClassLog(log: ClassLog): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.CLASS_LOGS, 'readwrite');
    const store = transaction.objectStore(STORES.CLASS_LOGS);
    const request = store.put(log);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteClassLog(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.CLASS_LOGS, 'readwrite');
    const store = transaction.objectStore(STORES.CLASS_LOGS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAllTimetableEntries(): Promise<TimetableEntry[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.TIMETABLE, 'readonly');
    const store = transaction.objectStore(STORES.TIMETABLE);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function addTimetableEntry(entry: TimetableEntry): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.TIMETABLE, 'readwrite');
    const store = transaction.objectStore(STORES.TIMETABLE);
    const request = store.add(entry);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function updateTimetableEntry(entry: TimetableEntry): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.TIMETABLE, 'readwrite');
    const store = transaction.objectStore(STORES.TIMETABLE);
    const request = store.put(entry);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteTimetableEntry(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.TIMETABLE, 'readwrite');
    const store = transaction.objectStore(STORES.TIMETABLE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getSettings(): Promise<Settings> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.SETTINGS, 'readonly');
    const store = transaction.objectStore(STORES.SETTINGS);
    const request = store.get('app_settings');

    request.onsuccess = () => {
      const result = request.result;
      resolve(result?.value || getDefaultSettings());
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveSettings(settings: Settings): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.SETTINGS, 'readwrite');
    const store = transaction.objectStore(STORES.SETTINGS);
    const request = store.put({ key: 'app_settings', value: settings });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function getDefaultSettings(): Settings {
  return {
    darkMode: false,
    autoMarkPresent: true,
    autoCreateFromTimetable: false,
    remindersEnabled: true,
    weeklyReminderDay: 0, // Sunday
    weeklyReminderTime: '20:00',
  };
}
