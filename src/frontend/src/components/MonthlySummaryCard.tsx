// Monthly summary component with per-class occurrence counting

import type { ClassLog } from '../storage/models';
import { TrendingUp } from 'lucide-react';

interface MonthlySummaryCardProps {
  logs: ClassLog[];
}

export default function MonthlySummaryCard({ logs }: MonthlySummaryCardProps) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthLogs = logs.filter((log) => {
    const logDate = new Date(log.date);
    return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
  });

  // Count individual class occurrences
  const totalConducted = monthLogs.length;
  const totalAttended = monthLogs.filter((log) => log.attendanceStatus === 'Present').length;
  const percentage = totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 0;

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Monthly Summary</h3>
      </div>
      
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">{monthNames[currentMonth]} {currentYear}</div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Total Classes</span>
          <span className="text-lg font-semibold">{totalConducted}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Attended</span>
          <span className="text-lg font-semibold">{totalAttended}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Overall %</span>
          <span className="text-lg font-semibold text-primary">{percentage.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
