// Record detail sheet with per-class attendance editing

import { useState } from 'react';
import type { ClassLog, AttendanceStatus } from '../storage/models';
import { X, Edit2, Trash2 } from 'lucide-react';
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

  const handleSave = () => {
    onUpdate({
      ...log,
      topic: topic.trim() || undefined,
      attendanceStatus,
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
      <div className="bg-card border-t md:border border-border rounded-t-lg md:rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Class Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Subject & Type */}
          <div>
            <div className="text-sm text-muted-foreground">Subject</div>
            <div className="font-semibold">{log.subject}</div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Type</div>
            <div className="font-semibold">{log.type}</div>
          </div>

          {/* Date */}
          <div>
            <div className="text-sm text-muted-foreground">Date</div>
            <div className="font-semibold">{new Date(log.date).toLocaleDateString('en-IN')}</div>
          </div>

          {/* Time */}
          {(log.startTime || log.endTime) && (
            <div>
              <div className="text-sm text-muted-foreground">Time</div>
              <div className="font-semibold">
                {log.startTime && log.endTime
                  ? `${log.startTime} - ${log.endTime}`
                  : log.startTime || log.endTime}
              </div>
            </div>
          )}

          {/* Topic */}
          <div>
            <div className="text-sm text-muted-foreground">Topic</div>
            {editing ? (
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter topic"
                className="w-full px-3 py-2 bg-background border border-input rounded-md mt-1"
              />
            ) : (
              <div className="font-semibold">{log.topic || 'No topic'}</div>
            )}
          </div>

          {/* Attendance Status */}
          <div>
            <div className="text-sm text-muted-foreground mb-2">Attendance Status</div>
            {editing ? (
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-input rounded-md cursor-pointer hover:bg-muted/50">
                  <input
                    type="radio"
                    name="status"
                    value="Present"
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
                    value="Absent"
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
                    value="Not Marked"
                    checked={attendanceStatus === 'Not Marked'}
                    onChange={() => setAttendanceStatus('Not Marked')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Not Marked</span>
                </label>
              </div>
            ) : (
              <div>{getStatusBadge(log.attendanceStatus)}</div>
            )}
          </div>

          {/* Source */}
          <div>
            <div className="text-sm text-muted-foreground">Source</div>
            <div className="font-semibold capitalize">{log.source}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          {editing ? (
            <>
              <Button onClick={handleSave} className="flex-1">
                Save Changes
              </Button>
              <Button onClick={() => setEditing(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setEditing(true)} variant="outline" className="flex-1">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
