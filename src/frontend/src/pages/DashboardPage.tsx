// Dashboard page with subject cards, today's schedule, and monthly summary

import { useClassLogs, useTimetable } from '../hooks/useLocalStore';
import { getAllSubjectStats } from '../domain/attendanceRules';
import SubjectStatsCard from '../components/SubjectStatsCard';
import TodaySchedule from '../components/TodaySchedule';
import NextClassCard from '../components/NextClassCard';
import MonthlySummaryCard from '../components/MonthlySummaryCard';

export default function DashboardPage() {
  const { logs, loading: logsLoading } = useClassLogs();
  const { entries: timetableEntries } = useTimetable();

  if (logsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const stats = getAllSubjectStats(logs);
  const subjects = ['Anatomy', 'Physiology', 'Biochemistry'] as const;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary">MedAttend Pro</h1>
        <p className="text-sm text-muted-foreground">MBBS Academic Tracker</p>
      </div>

      {/* Hero Image */}
      <div className="rounded-lg overflow-hidden">
        <img
          src="/assets/generated/dashboard-hero.dim_1600x900.png"
          alt="Medical Education"
          className="w-full h-48 object-cover"
        />
      </div>

      {/* Today's Schedule and Next Class */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TodaySchedule entries={timetableEntries} />
        <NextClassCard entries={timetableEntries} />
      </div>

      {/* Monthly Summary */}
      <MonthlySummaryCard logs={logs} />

      {/* Subject Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Attendance Overview</h2>
        {subjects.map((subject) => {
          const theoryStats = stats.find((s) => s.subject === subject && s.category === 'Theory');
          const practicalStats = stats.find((s) => s.subject === subject && s.category === 'Practical');
          
          return (
            <SubjectStatsCard
              key={subject}
              subject={subject}
              theoryStats={theoryStats!}
              practicalStats={practicalStats!}
            />
          );
        })}
      </div>
    </div>
  );
}
