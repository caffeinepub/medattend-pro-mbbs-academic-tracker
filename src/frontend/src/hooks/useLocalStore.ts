// React hooks for local storage with reactivity

import { useState, useEffect, useCallback } from 'react';
import type { ClassLog, TimetableEntry, Settings, AttendanceStatus } from '../storage/models';
import * as db from '../storage/db';

// Event emitter for cross-component updates
type EventType = 'classLogs' | 'timetable' | 'settings';
const listeners = new Map<EventType, Set<() => void>>();

function emit(event: EventType) {
  listeners.get(event)?.forEach((fn) => fn());
}

function subscribe(event: EventType, callback: () => void) {
  if (!listeners.has(event)) {
    listeners.set(event, new Set());
  }
  listeners.get(event)!.add(callback);
  return () => {
    listeners.get(event)?.delete(callback);
  };
}

export function useClassLogs() {
  const [logs, setLogs] = useState<ClassLog[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await db.getAllClassLogs();
      setLogs(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Failed to load class logs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = subscribe('classLogs', refresh);
    return unsubscribe;
  }, [refresh]);

  const addLog = useCallback(async (log: ClassLog) => {
    await db.addClassLog(log);
    emit('classLogs');
  }, []);

  const addMultipleLogs = useCallback(async (logs: ClassLog[]) => {
    await db.addMultipleClassLogs(logs);
    emit('classLogs');
  }, []);

  const updateLog = useCallback(async (log: ClassLog) => {
    await db.updateClassLog(log);
    emit('classLogs');
  }, []);

  const updateAttendanceStatus = useCallback(async (id: string, status: AttendanceStatus) => {
    const allLogs = await db.getAllClassLogs();
    const log = allLogs.find((l) => l.id === id);
    if (log) {
      await db.updateClassLog({ ...log, attendanceStatus: status });
      emit('classLogs');
    }
  }, []);

  const deleteLog = useCallback(async (id: string) => {
    await db.deleteClassLog(id);
    emit('classLogs');
  }, []);

  return { logs, loading, addLog, addMultipleLogs, updateLog, updateAttendanceStatus, deleteLog, refresh };
}

export function useTimetable() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await db.getAllTimetableEntries();
      setEntries(data.sort((a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
        return a.startTime.localeCompare(b.startTime);
      }));
    } catch (error) {
      console.error('Failed to load timetable:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = subscribe('timetable', refresh);
    return unsubscribe;
  }, [refresh]);

  const addEntry = useCallback(async (entry: TimetableEntry) => {
    await db.addTimetableEntry(entry);
    emit('timetable');
  }, []);

  const updateEntry = useCallback(async (entry: TimetableEntry) => {
    await db.updateTimetableEntry(entry);
    emit('timetable');
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    await db.deleteTimetableEntry(id);
    emit('timetable');
  }, []);

  return { entries, loading, addEntry, updateEntry, deleteEntry, refresh };
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await db.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = subscribe('settings', refresh);
    return unsubscribe;
  }, [refresh]);

  const updateSettings = useCallback(async (newSettings: Settings) => {
    await db.saveSettings(newSettings);
    emit('settings');
  }, []);

  return { settings, loading, updateSettings, refresh };
}
