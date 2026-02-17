// Subject statistics card with Theory/Practical metrics

import type { SubjectName, AttendanceStats } from '../storage/models';
import { getStatusColor } from '../domain/statusColor';
import { calculateClassesNeeded, calculateSafeMisses } from '../domain/eligibilityMath';

interface SubjectStatsCardProps {
  subject: SubjectName;
  theoryStats: AttendanceStats;
  practicalStats: AttendanceStats;
}

export default function SubjectStatsCard({ subject, theoryStats, practicalStats }: SubjectStatsCardProps) {
  const theoryStatus = getStatusColor(theoryStats.percentage, theoryStats.required);
  const practicalStatus = getStatusColor(practicalStats.percentage, practicalStats.required);

  const theoryDeficit = calculateClassesNeeded(theoryStats.attended, theoryStats.conducted, theoryStats.required);
  const theorySafe = calculateSafeMisses(theoryStats.attended, theoryStats.conducted, theoryStats.required);
  
  const practicalDeficit = calculateClassesNeeded(practicalStats.attended, practicalStats.conducted, practicalStats.required);
  const practicalSafe = calculateSafeMisses(practicalStats.attended, practicalStats.conducted, practicalStats.required);

  const statusColors = {
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">{subject}</h3>
      
      <div className="space-y-4">
        {/* Theory */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Theory</span>
            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[theoryStatus]}`}>
              {theoryStats.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{theoryStats.attended} / {theoryStats.conducted} classes</span>
            <span>Required: {theoryStats.required}%</span>
          </div>
          <div className="text-sm font-medium">
            {theoryDeficit > 0 ? (
              <span className="text-red-600 dark:text-red-400">Need {theoryDeficit} classes</span>
            ) : (
              <span className="text-green-600 dark:text-green-400">Can miss {theorySafe} classes</span>
            )}
          </div>
        </div>

        {/* Practical */}
        <div className="space-y-2 pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Practical</span>
            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[practicalStatus]}`}>
              {practicalStats.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{practicalStats.attended} / {practicalStats.conducted} classes</span>
            <span>Required: {practicalStats.required}%</span>
          </div>
          <div className="text-sm font-medium">
            {practicalDeficit > 0 ? (
              <span className="text-red-600 dark:text-red-400">Need {practicalDeficit} classes</span>
            ) : (
              <span className="text-green-600 dark:text-green-400">Can miss {practicalSafe} classes</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
