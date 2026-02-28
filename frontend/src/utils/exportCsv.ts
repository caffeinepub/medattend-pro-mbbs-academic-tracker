// CSV export utility for per-class attendance records

import type { ClassLog } from '../storage/models';

export function exportToCSV(logs: ClassLog[]): void {
  const headers = ['Date', 'Subject', 'Type', 'Topic', 'Attendance Status', 'Time', 'Source'];
  
  const rows = logs.map((log) => [
    log.date,
    log.subject,
    log.type,
    log.topic || '',
    log.attendanceStatus,
    log.startTime && log.endTime ? `${log.startTime}-${log.endTime}` : (log.startTime || log.endTime || ''),
    log.source,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `medattend_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
