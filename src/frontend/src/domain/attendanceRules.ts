// Attendance calculation rules and thresholds

import type { ClassLog, SubjectName, AttendanceCategory, AttendanceStats } from '../storage/models';
import { mapTypeToCategory } from './subjects';

export const THRESHOLDS = {
  Theory: 75,
  Practical: 80,
};

export function calculateAttendanceStats(
  logs: ClassLog[],
  subject: SubjectName,
  category: AttendanceCategory
): AttendanceStats {
  const relevantLogs = logs.filter((log) => {
    return log.subject === subject && mapTypeToCategory(log.subject, log.type) === category;
  });

  // Count individual class occurrences
  const conducted = relevantLogs.length;
  const attended = relevantLogs.filter((log) => log.attendanceStatus === 'Present').length;
  const percentage = conducted > 0 ? (attended / conducted) * 100 : 0;

  return {
    subject,
    category,
    attended,
    conducted,
    percentage,
    required: THRESHOLDS[category],
  };
}

export function getAllSubjectStats(logs: ClassLog[]): AttendanceStats[] {
  const subjects: SubjectName[] = ['Anatomy', 'Physiology', 'Biochemistry'];
  const categories: AttendanceCategory[] = ['Theory', 'Practical'];
  
  const stats: AttendanceStats[] = [];
  
  for (const subject of subjects) {
    for (const category of categories) {
      stats.push(calculateAttendanceStats(logs, subject, category));
    }
  }
  
  return stats;
}
