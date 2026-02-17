// Weekly timetable grid component

import type { TimetableEntry } from '../../storage/models';
import { Edit2, Trash2 } from 'lucide-react';

interface TimetableGridProps {
  entries: TimetableEntry[];
  onEdit: (entry: TimetableEntry) => void;
  onDelete: (id: string) => void;
}

export default function TimetableGrid({ entries, onEdit, onDelete }: TimetableGridProps) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayNumbers = [1, 2, 3, 4, 5, 6]; // Monday=1, ..., Saturday=6

  return (
    <div className="space-y-4">
      {dayNumbers.map((dayNum, idx) => {
        const dayEntries = entries.filter((e) => e.dayOfWeek === dayNum);
        
        return (
          <div key={dayNum} className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-3">{days[idx]}</h3>
            
            {dayEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No classes scheduled</p>
            ) : (
              <div className="space-y-2">
                {dayEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{entry.subject}</div>
                      <div className="text-sm text-muted-foreground">{entry.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {entry.startTime} - {entry.endTime}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(entry)}
                        className="p-2 hover:bg-background rounded-md transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(entry.id)}
                        className="p-2 hover:bg-background rounded-md transition-colors text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
