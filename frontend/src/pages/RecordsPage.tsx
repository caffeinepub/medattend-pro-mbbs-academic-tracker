// Records page with filters and per-class editing including AETCOM and time/duration display

import { useState, useMemo } from 'react';
import { useClassLogs } from '../hooks/useLocalStore';
import type { SubjectName, SubjectType } from '../storage/models';
import { SUBJECTS } from '../domain/subjects';
import RecordDetailSheet from '../components/RecordDetailSheet';
import type { ClassLog } from '../storage/models';
import { Search, Clock } from 'lucide-react';

export default function RecordsPage() {
  const { logs, updateLog, deleteLog } = useClassLogs();
  const [selectedLog, setSelectedLog] = useState<ClassLog | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<SubjectName | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<SubjectType | 'all'>('all');
  const [searchTopic, setSearchTopic] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (subjectFilter !== 'all' && log.subject !== subjectFilter) return false;
      if (typeFilter !== 'all' && log.type !== typeFilter) return false;
      if (searchTopic && !log.topic?.toLowerCase().includes(searchTopic.toLowerCase())) return false;
      if (dateFrom && log.date < dateFrom) return false;
      if (dateTo && log.date > dateTo) return false;
      return true;
    });
  }, [logs, subjectFilter, typeFilter, searchTopic, dateFrom, dateTo]);

  const allTypes: SubjectType[] = ['Theory', 'DH', 'Human Physiology Lab', 'Hematology Lab', 'Biochemistry Lab', 'AETCOM'];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Absent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Records</h1>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Subject Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value as SubjectName | 'all')}
              className="w-full px-3 py-2 bg-background border border-input rounded-md"
            >
              <option value="all">All Subjects</option>
              {SUBJECTS.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as SubjectType | 'all')}
              className="w-full px-3 py-2 bg-background border border-input rounded-md"
            >
              <option value="all">All Types</option>
              {allTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div className="space-y-2">
            <label className="text-sm font-medium">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md"
            />
          </div>

          {/* Date To */}
          <div className="space-y-2">
            <label className="text-sm font-medium">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md"
            />
          </div>
        </div>

        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Search by Topic</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTopic}
              onChange={(e) => setSearchTopic(e.target.value)}
              placeholder="Search topics..."
              className="w-full pl-10 pr-3 py-2 bg-background border border-input rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">
          {filteredLogs.length} {filteredLogs.length === 1 ? 'record' : 'records'} found
        </div>

        {filteredLogs.map((log) => (
          <button
            key={log.id}
            onClick={() => setSelectedLog(log)}
            className="w-full text-left bg-card border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-semibold">{log.subject}</div>
                <div className="text-sm text-muted-foreground">
                  {log.type === 'AETCOM' ? `${log.subject} ${log.type}` : log.type}
                </div>
                {log.topic && <div className="text-sm mt-1">{log.topic}</div>}
                {(log.startTime || log.endTime) && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {log.startTime && log.endTime
                        ? `${log.startTime} - ${log.endTime}`
                        : log.startTime || log.endTime}
                      {log.duration && ` (${log.duration} min)`}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-right space-y-1">
                <div className="text-sm font-medium">{new Date(log.date).toLocaleDateString('en-IN')}</div>
                <span className={`inline-block text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(log.attendanceStatus)}`}>
                  {log.attendanceStatus}
                </span>
              </div>
            </div>
          </button>
        ))}

        {filteredLogs.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No records found
          </div>
        )}
      </div>

      {selectedLog && (
        <RecordDetailSheet
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
          onUpdate={updateLog}
          onDelete={deleteLog}
        />
      )}
    </div>
  );
}
