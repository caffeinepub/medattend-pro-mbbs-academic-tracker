// Core data models for offline storage

export type SubjectName = 'Anatomy' | 'Physiology' | 'Biochemistry';

export type SubjectType = 
  | 'Theory'
  | 'DH' // Dissection Hall (Anatomy)
  | 'Human Physiology Lab'
  | 'Hematology Lab'
  | 'Biochemistry Lab';

export type AttendanceCategory = 'Theory' | 'Practical';

export type AttendanceStatus = 'Present' | 'Absent' | 'Not Marked';

export interface ClassLog {
  id: string;
  subject: SubjectName;
  type: SubjectType;
  date: string; // ISO date string
  topic?: string;
  attendanceStatus: AttendanceStatus;
  // Legacy fields for migration compatibility
  attended?: number;
  conducted?: number;
  source: 'manual' | 'timetable';
  createdAt: string;
  // For timetable-linked classes
  timetableEntryId?: string;
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
}

export interface TimetableEntry {
  id: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  subject: SubjectName;
  type: SubjectType;
  repeatWeekly: boolean;
  createdAt: string;
}

export interface Settings {
  darkMode: boolean;
  autoMarkPresent: boolean;
  autoCreateFromTimetable: boolean;
  remindersEnabled: boolean;
  weeklyReminderDay: number; // 0-6
  weeklyReminderTime: string; // HH:mm
}

export interface AttendanceStats {
  subject: SubjectName;
  category: AttendanceCategory;
  attended: number;
  conducted: number;
  percentage: number;
  required: number;
}
