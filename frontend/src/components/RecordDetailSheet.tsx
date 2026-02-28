// Record detail sheet with per-class attendance editing and time/duration display

import { useState } from 'react';
import type { ClassLog, AttendanceStatus } from '../storage/models';
import { X, Edit2, Trash2, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface RecordDetailSheetProps {
  log: ClassLog;
  onClose: () => void;
  onUpdate: (log: ClassLog) => void;
  onDelete: (id: string) => void;
}

export default function RecordDetailSheet({ log, onClose, onUpdate, onDelete }: RecordDetailSheetProps) {
  const [editing, setEditing] = useState(false);
  const [topic, setTopic] = useState(log.topic || '');
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>(log.attendanceStatus);
  const [startTime, setStartTime] = useState(log.startTime || '');
  const [duration, setDuration] = useState<number>(log.duration || 60);

  const calculateEndTime = (start: string, durationMinutes: number): string => {
    if (!start) return '';
    const [hours, minutes] = start.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    const endTime = startTime ? calculateEndTime(startTime, duration) : undefined;
    onUpdate({
      ...log,
      topic: topic.trim() || undefined,
      attendanceStatus,
      startTime: startTime || undefined,
      endTime,
      duration: startTime ? duration : undefined,
    });
    setEditing(false);
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Delete this record?')) {
      onDelete(log.id);
      onClose();
    }
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'Present':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Present</Badge>;
      case 'Absent':
        return <Badge variant="destructive">Absent</Badge>;
      case 'Not Marked':
        return <Badge variant="outline">Not Marked</Badge>;
    }
  };

  const endTime = startTime ? calculateEndTime(startTime, duration) : log.endTime;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
      <div className="bg-card border-t md:border border-border rounded-t-lg md:rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Class Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!editing ? (
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Subject</div>
              <div className="font-semibold">{log.subject}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Type</div>
              <div>{log.type}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Date</div>
              <div>{new Date(log.date).toLocaleDateString('en-IN')}</div>
            </div>

            {(log.startTime || startTime) && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Time</div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {log.startTime || startTime}
                    {endTime && ` - ${endTime}`}
                    {log.duration && ` (${log.duration} min)`}
                  </span>
                </div>
              </div>
            )}

            {log.topic && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Topic</div>
                <div>{log.topic}</div>
              </div>
            )}

            <div>
              <div className="text-sm text-muted-foreground mb-1">Status</div>
              {getStatusBadge(log.attendanceStatus)}
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={() => setEditing(true)} variant="outline" className="flex-1">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Time and Duration */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Time (Optional)</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md"
              />
            </div>

            {startTime && (
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
            )}

            {startTime && endTime && (
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <span className="text-muted-foreground">End time: </span>
                <span className="font-medium">{endTime}</span>
              </div>
            )}

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

            <div className="space-y-2">
              <label className="text-sm font-medium">Attendance Status</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-input rounded-md cursor-pointer hover:bg-muted/50">
                  <input
                    type="radio"
                    name="status"
                    checked={attendanceStatus === 'Present'}
                    onChange={() => setAttendanceStatus('Present')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Present</span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-input rounded-md cursor-pointer hover:bg-muted/50">
                  <input
                    type="radio"
                    name="status"
                    checked={attendanceStatus === 'Absent'}
                    onChange={() => setAttendanceStatus('Absent')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Absent</span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-input rounded-md cursor-pointer hover:bg-muted/50">
                  <input
                    type="radio"
                    name="status"
                    checked={attendanceStatus === 'Not Marked'}
                    onChange={() => setAttendanceStatus('Not Marked')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Not Marked</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={() => setEditing(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1">
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
