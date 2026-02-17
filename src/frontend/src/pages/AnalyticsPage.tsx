// Analytics page with per-class occurrence based calculations

import { useMemo } from 'react';
import { useClassLogs } from '../hooks/useLocalStore';
import { getAllSubjectStats } from '../domain/attendanceRules';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  const { logs } = useClassLogs();
  const stats = useMemo(() => getAllSubjectStats(logs), [logs]);

  // Group by subject for comparison
  const subjectData = useMemo(() => {
    const subjects = ['Anatomy', 'Physiology', 'Biochemistry'] as const;
    return subjects.map((subject) => {
      const theory = stats.find((s) => s.subject === subject && s.category === 'Theory');
      const practical = stats.find((s) => s.subject === subject && s.category === 'Practical');
      return { subject, theory: theory?.percentage || 0, practical: practical?.percentage || 0 };
    });
  }, [stats]);

  // Monthly trend - count individual class occurrences
  const monthlyData = useMemo(() => {
    const months = new Map<string, { attended: number; conducted: number }>();
    
    logs.forEach((log) => {
      const date = new Date(log.date);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!months.has(key)) {
        months.set(key, { attended: 0, conducted: 0 });
      }
      
      const data = months.get(key)!;
      data.conducted += 1; // Each log is one class occurrence
      if (log.attendanceStatus === 'Present') {
        data.attended += 1;
      }
    });

    return Array.from(months.entries())
      .map(([month, data]) => ({
        month,
        percentage: data.conducted > 0 ? (data.attended / data.conducted) * 100 : 0,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  }, [logs]);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      {/* Subject Comparison */}
      <div className="bg-card border border-border rounded-lg p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Subject-wise Comparison</h2>
        </div>
        
        <div className="space-y-4">
          {subjectData.map((data) => (
            <div key={data.subject} className="space-y-2">
              <div className="text-sm font-medium">{data.subject}</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-20 text-xs text-muted-foreground">Theory</div>
                  <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-primary h-full flex items-center justify-end pr-2 text-xs text-primary-foreground font-medium transition-all"
                      style={{ width: `${Math.min(100, data.theory)}%` }}
                    >
                      {data.theory > 10 && `${data.theory.toFixed(1)}%`}
                    </div>
                  </div>
                  {data.theory <= 10 && (
                    <div className="w-12 text-xs text-muted-foreground">{data.theory.toFixed(1)}%</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 text-xs text-muted-foreground">Practical</div>
                  <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-chart-2 h-full flex items-center justify-end pr-2 text-xs text-primary-foreground font-medium transition-all"
                      style={{ width: `${Math.min(100, data.practical)}%` }}
                    >
                      {data.practical > 10 && `${data.practical.toFixed(1)}%`}
                    </div>
                  </div>
                  {data.practical <= 10 && (
                    <div className="w-12 text-xs text-muted-foreground">{data.practical.toFixed(1)}%</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h2 className="text-lg font-semibold mb-4">Monthly Attendance Trend</h2>
        
        {monthlyData.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data available</p>
        ) : (
          <div className="space-y-3">
            {monthlyData.map((data) => {
              const [year, month] = data.month.split('-');
              const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
              
              return (
                <div key={data.month} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-muted-foreground">{monthName}</div>
                  <div className="flex-1 bg-muted rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-chart-3 h-full flex items-center justify-end pr-3 text-sm text-primary-foreground font-medium transition-all"
                      style={{ width: `${Math.min(100, data.percentage)}%` }}
                    >
                      {data.percentage > 15 && `${data.percentage.toFixed(1)}%`}
                    </div>
                  </div>
                  {data.percentage <= 15 && (
                    <div className="w-16 text-sm text-muted-foreground">{data.percentage.toFixed(1)}%</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
