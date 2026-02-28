// Next upcoming class component with duration display

import type { TimetableEntry } from '../storage/models';
import { Clock } from 'lucide-react';

interface NextClassCardProps {
  entries: TimetableEntry[];
}

export default function NextClassCard({ entries }: NextClassCardProps) {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // Find next class
  let nextClass: TimetableEntry | null = null;
  
  // First, check today's remaining classes
  const todayRemaining = entries
    .filter((e) => e.dayOfWeek === currentDay && e.startTime > currentTime)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  
  if (todayRemaining.length > 0) {
    nextClass = todayRemaining[0];
  } else {
    // Find next day's first class
    for (let i = 1; i <= 7; i++) {
      const checkDay = (currentDay + i) % 7;
      const dayClasses = entries
        .filter((e) => e.dayOfWeek === checkDay)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
      
      if (dayClasses.length > 0) {
        nextClass = dayClasses[0];
        break;
      }
    }
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Next Class</h3>
      </div>
      
      {!nextClass ? (
        <p className="text-sm text-muted-foreground">No upcoming classes</p>
      ) : (
        <div className="space-y-2">
          <div className="text-lg font-semibold">{nextClass.subject}</div>
          <div className="text-sm text-muted-foreground">{nextClass.type}</div>
          <div className="text-sm">
            <span className="font-medium">{dayNames[nextClass.dayOfWeek]}</span>
            <span className="text-muted-foreground ml-2">
              {nextClass.startTime} - {nextClass.endTime}
            </span>
            {nextClass.duration && (
              <span className="text-xs text-muted-foreground ml-2">
                ({nextClass.duration} min)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
