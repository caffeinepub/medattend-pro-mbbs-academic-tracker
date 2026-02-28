// Dashboard displaying subject attendance cards for all four subjects, today's schedule, next class, and monthly summary

import { useMemo } from 'react';
import { useClassLogs, useTimetable } from '../hooks/useLocalStore';
import { getAllSubjectStats } from '../domain/attendanceRules';
import SubjectStatsCard from '../components/SubjectStatsCard';
import TodaySchedule from '../components/TodaySchedule';
import NextClassCard from '../components/NextClassCard';
import MonthlySummaryCard from '../components/MonthlySummaryCard';
import type { SubjectName } from '../storage/models';

export default function DashboardPage() {
  const { logs } = useClassLogs();
  const { entries } = useTimetable();
  const stats = useMemo(() => getAllSubjectStats(logs), [logs]);

  const subjects: SubjectName[] = ['Anatomy', 'Physiology', 'Biochemistry', 'Community Medicine'];

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Hero Section */}
      <div className="relative rounded-xl overflow-hidden shadow-lg">
        <img
          src="/assets/generated/dashboard-hero.dim_1600x900.png"
          alt="Medical Education"
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-1">Attendance Tracker</h1>
            <p className="text-sm opacity-90">1st Year MBBS</p>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <TodaySchedule entries={entries} />

      {/* Next Class */}
      <NextClassCard entries={entries} />

      {/* Monthly Summary */}
      <MonthlySummaryCard logs={logs} />

      {/* Subject Stats */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Subject Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {subjects.map((subject) => {
            const theoryStats = stats.find((s) => s.subject === subject && s.category === 'Theory');
            const practicalStats = stats.find((s) => s.subject === subject && s.category === 'Practical');

            // Both stats should always exist since getAllSubjectStats covers all subjects
            if (!theoryStats || !practicalStats) return null;

            return (
              <SubjectStatsCard
                key={subject}
                subject={subject}
                theoryStats={theoryStats}
                practicalStats={practicalStats}
                logs={logs}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
