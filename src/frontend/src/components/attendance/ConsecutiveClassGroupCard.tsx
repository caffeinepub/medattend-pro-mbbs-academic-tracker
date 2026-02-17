// Grouped UI card for consecutive class periods

import { useState } from 'react';
import type { ConsecutiveGroup } from '../../domain/groupConsecutiveTimetable';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import ClassAttendanceCard from './ClassAttendanceCard';
import type { ClassLog } from '../../storage/models';

interface ConsecutiveClassGroupCardProps {
  group: ConsecutiveGroup;
  onMarkPresent: (entryId: string, log: ClassLog | undefined) => void;
  onMarkAbsent: (entryId: string, log: ClassLog | undefined) => void;
  updating: string | null;
}

export default function ConsecutiveClassGroupCard({
  group,
  onMarkPresent,
  onMarkAbsent,
  updating,
}: ConsecutiveClassGroupCardProps) {
  const [expanded, setExpanded] = useState(false);

  // If only one period, render directly without grouping UI
  if (group.count === 1) {
    const { entry, log } = group.entries[0];
    const displayLog: ClassLog = log || {
      id: entry.id,
      subject: entry.subject,
      type: entry.type,
      date: new Date().toISOString().split('T')[0],
      attendanceStatus: 'Not Marked',
      source: 'timetable',
      createdAt: new Date().toISOString(),
      timetableEntryId: entry.id,
      startTime: entry.startTime,
      endTime: entry.endTime,
    };

    return (
      <ClassAttendanceCard
        classLog={displayLog}
        onMarkPresent={() => onMarkPresent(entry.id, log)}
        onMarkAbsent={() => onMarkAbsent(entry.id, log)}
        disabled={updating === entry.id}
      />
    );
  }

  // Multiple consecutive periods - show grouped UI
  return (
    <div className="bg-card border-2 border-primary/20 rounded-lg overflow-hidden">
      {/* Group header */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="font-semibold text-base">{group.subject}</div>
            <div className="text-sm text-muted-foreground">{group.type}</div>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {group.count} periods
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{group.startTime} - {group.endTime}</span>
        </div>

        <Button
          onClick={() => setExpanded(!expanded)}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Hide individual periods
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              Show individual periods
            </>
          )}
        </Button>
      </div>

      {/* Expanded individual periods */}
      {expanded && (
        <div className="border-t border-border bg-muted/30 p-3 space-y-3">
          {group.entries.map(({ entry, log }, index) => {
            const displayLog: ClassLog = log || {
              id: entry.id,
              subject: entry.subject,
              type: entry.type,
              date: new Date().toISOString().split('T')[0],
              attendanceStatus: 'Not Marked',
              source: 'timetable',
              createdAt: new Date().toISOString(),
              timetableEntryId: entry.id,
              startTime: entry.startTime,
              endTime: entry.endTime,
            };

            return (
              <div key={entry.id} className="relative">
                <div className="absolute -left-2 top-4 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                  {index + 1}
                </div>
                <ClassAttendanceCard
                  classLog={displayLog}
                  onMarkPresent={() => onMarkPresent(entry.id, log)}
                  onMarkAbsent={() => onMarkAbsent(entry.id, log)}
                  disabled={updating === entry.id}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
