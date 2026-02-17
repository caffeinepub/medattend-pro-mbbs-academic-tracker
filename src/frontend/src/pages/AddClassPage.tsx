// Add class page with per-class creation for consecutive classes

import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useClassLogs } from '../hooks/useLocalStore';
import { SUBJECTS, getTypesForSubject } from '../domain/subjects';
import type { SubjectName, SubjectType, ClassLog } from '../storage/models';
import { ArrowLeft } from 'lucide-react';

export default function AddClassPage() {
  const navigate = useNavigate();
  const { addMultipleLogs } = useClassLogs();

  const [subject, setSubject] = useState<SubjectName>('Anatomy');
  const [type, setType] = useState<SubjectType>('Theory');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [topic, setTopic] = useState('');
  const [isMultiple, setIsMultiple] = useState(false);
  const [numClasses, setNumClasses] = useState(2);
  const [attendanceMode, setAttendanceMode] = useState<'present' | 'absent' | 'partial'>('present');
  const [partialAttended, setPartialAttended] = useState(1);
  const [saving, setSaving] = useState(false);

  const availableTypes = getTypesForSubject(subject);

  const handleSubjectChange = (newSubject: SubjectName) => {
    setSubject(newSubject);
    const types = getTypesForSubject(newSubject);
    setType(types[0]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const numPeriods = isMultiple ? numClasses : 1;
      const logsToCreate: ClassLog[] = [];

      for (let i = 0; i < numPeriods; i++) {
        let status: 'Present' | 'Absent' = 'Present';

        if (attendanceMode === 'absent') {
          status = 'Absent';
        } else if (attendanceMode === 'partial') {
          status = i < partialAttended ? 'Present' : 'Absent';
        }

        logsToCreate.push({
          id: crypto.randomUUID(),
          subject,
          type,
          date,
          topic: topic.trim() || undefined,
          attendanceStatus: status,
          source: 'manual',
          createdAt: new Date().toISOString(),
        });
      }

      await addMultipleLogs(logsToCreate);
      navigate({ to: '/' });
    } catch (error) {
      console.error('Failed to save class log:', error);
      alert('Failed to save class. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6">Add Class</h1>

      <div className="space-y-6">
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

        {/* Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-input rounded-md"
          />
        </div>

        {/* Topic */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Topic (Optional)</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Upper Limb Anatomy"
            className="w-full px-3 py-2 bg-background border border-input rounded-md"
          />
        </div>

        {/* Multiple consecutive classes toggle */}
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <input
            type="checkbox"
            id="multiple"
            checked={isMultiple}
            onChange={(e) => setIsMultiple(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="multiple" className="text-sm font-medium cursor-pointer">
            Multiple consecutive periods?
          </label>
        </div>

        {/* Number of classes */}
        {isMultiple && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Number of consecutive periods</label>
            <input
              type="number"
              min="2"
              max="10"
              value={numClasses}
              onChange={(e) => setNumClasses(Math.max(2, parseInt(e.target.value) || 2))}
              className="w-full px-3 py-2 bg-background border border-input rounded-md"
            />
            <p className="text-xs text-muted-foreground">
              This will create {numClasses} separate class records
            </p>
          </div>
        )}

        {/* Attendance mode */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Attendance</label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border border-input rounded-md cursor-pointer hover:bg-muted/50">
              <input
                type="radio"
                name="attendance"
                value="present"
                checked={attendanceMode === 'present'}
                onChange={() => setAttendanceMode('present')}
                className="w-4 h-4"
              />
              <span className="text-sm">Present ({isMultiple ? 'all periods' : 'this class'})</span>
            </label>
            <label className="flex items-center gap-3 p-3 border border-input rounded-md cursor-pointer hover:bg-muted/50">
              <input
                type="radio"
                name="attendance"
                value="absent"
                checked={attendanceMode === 'absent'}
                onChange={() => setAttendanceMode('absent')}
                className="w-4 h-4"
              />
              <span className="text-sm">Absent ({isMultiple ? 'all periods' : 'this class'})</span>
            </label>
            {isMultiple && (
              <label className="flex items-center gap-3 p-3 border border-input rounded-md cursor-pointer hover:bg-muted/50">
                <input
                  type="radio"
                  name="attendance"
                  value="partial"
                  checked={attendanceMode === 'partial'}
                  onChange={() => setAttendanceMode('partial')}
                  className="w-4 h-4"
                />
                <span className="text-sm">Partial attendance</span>
              </label>
            )}
          </div>
        </div>

        {/* Partial attendance input */}
        {isMultiple && attendanceMode === 'partial' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Periods attended</label>
            <input
              type="number"
              min="0"
              max={numClasses}
              value={partialAttended}
              onChange={(e) => setPartialAttended(Math.min(numClasses, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-full px-3 py-2 bg-background border border-input rounded-md"
            />
            <p className="text-xs text-muted-foreground">Out of {numClasses} periods</p>
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Class'}
        </button>
      </div>
    </div>
  );
}
