// Dialog for adding/editing timetable entries with AETCOM support and duration field

import { useState, useEffect } from 'react';
import type { TimetableEntry, SubjectName, SubjectType } from '../../storage/models';
import { SUBJECTS, getTypesForSubject, mapTypeToCategory } from '../../domain/subjects';
import { X } from 'lucide-react';

interface TimetableEntryDialogProps {
  open: boolean;
  entry: TimetableEntry | null;
  onClose: () => void;
  onSave: (entry: TimetableEntry) => void;
}

export default function TimetableEntryDialog({ open, entry, onClose, onSave }: TimetableEntryDialogProps) {
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState<number>(60);
  const [subject, setSubject] = useState<SubjectName>('Anatomy');
  const [type, setType] = useState<SubjectType>('Theory');
  const [repeatWeekly, setRepeatWeekly] = useState(true);
  const [showAetcom, setShowAetcom] = useState(false);

  useEffect(() => {
    if (entry) {
      setDayOfWeek(entry.dayOfWeek);
      setStartTime(entry.startTime);
      setDuration(entry.duration || 60);
      setSubject(entry.subject);
      setType(entry.type);
      setRepeatWeekly(entry.repeatWeekly);
      const category = mapTypeToCategory(entry.subject, entry.type);
      setShowAetcom(category === 'Practical' && entry.type !== 'AETCOM');
    } else {
      setDayOfWeek(1);
      setStartTime('09:00');
      setDuration(60);
      setSubject('Anatomy');
      setType('Theory');
      setRepeatWeekly(true);
      setShowAetcom(false);
    }
  }, [entry, open]);

  const handleSubjectChange = (newSubject: SubjectName) => {
    setSubject(newSubject);
    const types = getTypesForSubject(newSubject);
    setType(types[0]);
    setShowAetcom(false);
  };

  const handleTypeChange = (newType: SubjectType) => {
    setType(newType);
    // Show AETCOM info if a practical type is selected
    const category = mapTypeToCategory(subject, newType);
    setShowAetcom(category === 'Practical' && newType !== 'AETCOM');
  };

  const calculateEndTime = (start: string, durationMinutes: number): string => {
    const [hours, minutes] = start.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    const endTime = calculateEndTime(startTime, duration);
    const newEntry: TimetableEntry = {
      id: entry?.id || crypto.randomUUID(),
      dayOfWeek,
      startTime,
      endTime,
      subject,
      type,
      repeatWeekly,
      createdAt: entry?.createdAt || new Date().toISOString(),
      duration,
    };
    onSave(newEntry);
  };

  if (!open) return null;

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const availableTypes = getTypesForSubject(subject);
  const endTime = calculateEndTime(startTime, duration);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{entry ? 'Edit Entry' : 'Add Entry'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Day */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Day</label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-background border border-input rounded-md"
            >
              {days.map((day, idx) => (
                <option key={idx} value={idx}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          {/* Start Time */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md"
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-3 py-2 bg-background border border-input rounded-md"
            >
              <option value={60}>1 hour (60 min)</option>
              <option value={120}>2 hours (120 min)</option>
              <option value={180}>3 hours (180 min)</option>
              <option value={240}>4 hours (240 min)</option>
            </select>
          </div>

          {/* Calculated End Time Display */}
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <span className="text-muted-foreground">End time: </span>
            <span className="font-medium">{endTime}</span>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <select
              value={subject}
              onChange={(e) => handleSubjectChange(e.target.value as SubjectName)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md"
            >
              {SUBJECTS.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as SubjectType)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md"
            >
              {availableTypes.map((t) => (
                <option key={t} value={t}>
                  {t === 'AETCOM' ? `${subject} ${t}` : t}
                </option>
              ))}
            </select>
          </div>

          {/* AETCOM Info Banner */}
          {showAetcom && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-900 dark:text-blue-200">
                <strong>Note:</strong> AETCOM is also available for {subject} and counts toward Practical attendance.
              </p>
            </div>
          )}

          {/* Repeat Weekly */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="repeat"
              checked={repeatWeekly}
              onChange={(e) => setRepeatWeekly(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="repeat" className="text-sm font-medium cursor-pointer">
              Repeat weekly
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-2 border border-input rounded-md hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
