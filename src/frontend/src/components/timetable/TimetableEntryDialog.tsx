// Dialog for adding/editing timetable entries

import { useState, useEffect } from 'react';
import type { TimetableEntry, SubjectName, SubjectType } from '../../storage/models';
import { SUBJECTS, getTypesForSubject } from '../../domain/subjects';
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
  const [endTime, setEndTime] = useState('10:00');
  const [subject, setSubject] = useState<SubjectName>('Anatomy');
  const [type, setType] = useState<SubjectType>('Theory');
  const [repeatWeekly, setRepeatWeekly] = useState(true);

  useEffect(() => {
    if (entry) {
      setDayOfWeek(entry.dayOfWeek);
      setStartTime(entry.startTime);
      setEndTime(entry.endTime);
      setSubject(entry.subject);
      setType(entry.type);
      setRepeatWeekly(entry.repeatWeekly);
    } else {
      setDayOfWeek(1);
      setStartTime('09:00');
      setEndTime('10:00');
      setSubject('Anatomy');
      setType('Theory');
      setRepeatWeekly(true);
    }
  }, [entry, open]);

  const handleSubjectChange = (newSubject: SubjectName) => {
    setSubject(newSubject);
    const types = getTypesForSubject(newSubject);
    setType(types[0]);
  };

  const handleSave = () => {
    const newEntry: TimetableEntry = {
      id: entry?.id || crypto.randomUUID(),
      dayOfWeek,
      startTime,
      endTime,
      subject,
      type,
      repeatWeekly,
      createdAt: entry?.createdAt || new Date().toISOString(),
    };
    onSave(newEntry);
  };

  if (!open) return null;

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const availableTypes = getTypesForSubject(subject);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-md w-full p-6">
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

          {/* End Time */}
          <div className="space-y-2">
            <label className="text-sm font-medium">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md"
            />
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
              onChange={(e) => setType(e.target.value as SubjectType)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md"
            >
              {availableTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

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
