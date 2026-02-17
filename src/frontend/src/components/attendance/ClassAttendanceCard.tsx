// Per-class attendance card component

import type { ClassLog } from '../../storage/models';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Clock } from 'lucide-react';

interface ClassAttendanceCardProps {
  classLog: ClassLog;
  onMarkPresent: () => void;
  onMarkAbsent: () => void;
  disabled?: boolean;
}

export default function ClassAttendanceCard({
  classLog,
  onMarkPresent,
  onMarkAbsent,
  disabled = false,
}: ClassAttendanceCardProps) {
  const getStatusBadge = () => {
    switch (classLog.attendanceStatus) {
      case 'Present':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Present</Badge>;
      case 'Absent':
        return <Badge variant="destructive">Absent</Badge>;
      case 'Not Marked':
        return <Badge variant="outline">Not Marked</Badge>;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-semibold text-base">{classLog.subject}</div>
          <div className="text-sm text-muted-foreground">{classLog.type}</div>
          {classLog.topic && (
            <div className="text-sm mt-1 text-foreground/80">{classLog.topic}</div>
          )}
        </div>
        <div className="text-right">
          {getStatusBadge()}
        </div>
      </div>

      {(classLog.startTime || classLog.endTime) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>
            {classLog.startTime && classLog.endTime
              ? `${classLog.startTime} - ${classLog.endTime}`
              : classLog.startTime || classLog.endTime}
          </span>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={onMarkPresent}
          disabled={disabled || classLog.attendanceStatus === 'Present'}
          variant={classLog.attendanceStatus === 'Present' ? 'default' : 'outline'}
          className="flex-1"
          size="sm"
        >
          Present
        </Button>
        <Button
          onClick={onMarkAbsent}
          disabled={disabled || classLog.attendanceStatus === 'Absent'}
          variant={classLog.attendanceStatus === 'Absent' ? 'destructive' : 'outline'}
          className="flex-1"
          size="sm"
        >
          Absent
        </Button>
      </div>
    </div>
  );
}
