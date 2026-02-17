// Helper to group consecutive timetable entries by subject and type

import type { TimetableEntry, ClassLog } from '../storage/models';

export interface TimetableWithLog {
  entry: TimetableEntry;
  log: ClassLog | undefined;
}

export interface ConsecutiveGroup {
  subject: string;
  type: string;
  entries: TimetableWithLog[];
  startTime: string;
  endTime: string;
  count: number;
}

// Convert HH:mm to minutes for comparison
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Check if two time slots are consecutive (end time of first matches start time of second)
function areConsecutive(first: TimetableEntry, second: TimetableEntry): boolean {
  return first.endTime === second.startTime;
}

// Group consecutive timetable entries with same subject and type
export function groupConsecutiveTimetable(
  entriesWithLogs: TimetableWithLog[]
): ConsecutiveGroup[] {
  if (entriesWithLogs.length === 0) return [];

  // Sort by start time
  const sorted = [...entriesWithLogs].sort((a, b) => 
    timeToMinutes(a.entry.startTime) - timeToMinutes(b.entry.startTime)
  );

  const groups: ConsecutiveGroup[] = [];
  let currentGroup: TimetableWithLog[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1].entry;
    const curr = sorted[i].entry;

    // Check if current entry continues the group
    if (
      prev.subject === curr.subject &&
      prev.type === curr.type &&
      areConsecutive(prev, curr)
    ) {
      currentGroup.push(sorted[i]);
    } else {
      // Finalize current group
      groups.push(createGroup(currentGroup));
      currentGroup = [sorted[i]];
    }
  }

  // Add last group
  groups.push(createGroup(currentGroup));

  return groups;
}

function createGroup(entries: TimetableWithLog[]): ConsecutiveGroup {
  const first = entries[0].entry;
  const last = entries[entries.length - 1].entry;

  return {
    subject: first.subject,
    type: first.type,
    entries,
    startTime: first.startTime,
    endTime: last.endTime,
    count: entries.length,
  };
}
