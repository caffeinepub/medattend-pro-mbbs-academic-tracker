// Today's schedule with consecutive class grouping and duration support

import { useMemo, useState } from 'react';
import type { TimetableEntry, ClassLog } from '../storage/models';
import { useClassLogs } from '../hooks/useLocalStore';
import { Calendar } from 'lucide-react';
import { groupConsecutiveTimetable } from '../domain/groupConsecutiveTimetable';
import ConsecutiveClassGroupCard from './attendance/ConsecutiveClassGroupCard';

interface TodayScheduleProps {
  entries: TimetableEntry[];
}

export default function TodaySchedule({ entries }: TodayScheduleProps) {
  const today = new Date().getDay();
  const todayDate = new Date().toISOString().split('T')[0];
  const todayEntries = entries.filter((e) => e.dayOfWeek === today);
  const { logs, updateAttendanceStatus, addLog } = useClassLogs();
  const [updating, setUpdating] = useState<string | null>(null);

  // Match timetable entries with existing class logs for today
  const entriesWithLogs = useMemo(() => {
    return todayEntries.map((entry) => {
      const existingLog = logs.find(
        (log) =>
          log.date === todayDate &&
          log.timetableEntryId === entry.id
      );

      return {
        entry,
        log: existingLog,
      };
    });
  }, [todayEntries, logs, todayDate]);

  // Group consecutive classes
  const groupedClasses = useMemo(() => {
    return groupConsecutiveTimetable(entriesWithLogs);
  }, [entriesWithLogs]);

  const handleMarkAttendance = async (
    entryId: string,
    existingLog: ClassLog | undefined,
    status: 'Present' | 'Absent'
  ) => {
    setUpdating(entryId);
    try {
      const entry = todayEntries.find(e => e.id === entryId);
      if (!entry) return;

      if (existingLog) {
        // Update existing log
        await updateAttendanceStatus(existingLog.id, status);
      } else {
        // Create new log
        const newLog: ClassLog = {
          id: crypto.randomUUID(),
          subject: entry.subject,
          type: entry.type,
          date: todayDate,
          attendanceStatus: status,
          source: 'timetable',
          createdAt: new Date().toISOString(),
          timetableEntryId: entry.id,
          startTime: entry.startTime,
          endTime: entry.endTime,
          duration: entry.duration,
        };
        await addLog(newLog);
      }
    } catch (error) {
      console.error('Failed to mark attendance:', error);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Today's Schedule</h3>
      </div>
      
      {todayEntries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No classes scheduled today</p>
      ) : (
        <div className="space-y-3">
          {groupedClasses.map((group, index) => (
            <ConsecutiveClassGroupCard
              key={`${group.subject}-${group.type}-${index}`}
              group={group}
              onMarkPresent={(entryId, log) => handleMarkAttendance(entryId, log, 'Present')}
              onMarkAbsent={(entryId, log) => handleMarkAttendance(entryId, log, 'Absent')}
              updating={updating}
            />
          ))}
        </div>
      )}
    </div>
  );
}
