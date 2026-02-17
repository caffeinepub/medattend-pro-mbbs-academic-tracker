// Settings page

import { useSettings, useClassLogs } from '../hooks/useLocalStore';
import { getAllSubjectStats } from '../domain/attendanceRules';
import { exportToCSV } from '../utils/exportCsv';
import { exportToPDF } from '../utils/exportPdf';
import { Download, Moon, Sun } from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { logs } = useClassLogs();

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const handleExportCSV = () => {
    exportToCSV(logs);
  };

  const handleExportPDF = () => {
    const stats = getAllSubjectStats(logs);
    exportToPDF(stats);
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Appearance */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-4">Appearance</h2>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <div>
                <div className="font-medium">Dark Mode</div>
                <div className="text-sm text-muted-foreground">Toggle dark theme</div>
              </div>
            </div>
            <button
              onClick={() => updateSettings({ ...settings, darkMode: !settings.darkMode })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.darkMode ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.darkMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Attendance */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-4">Attendance</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Auto-mark Present</div>
                <div className="text-sm text-muted-foreground">Default to present when adding classes</div>
              </div>
              <button
                onClick={() => updateSettings({ ...settings, autoMarkPresent: !settings.autoMarkPresent })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.autoMarkPresent ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.autoMarkPresent ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Auto-create from Timetable</div>
                <div className="text-sm text-muted-foreground">Automatically log scheduled classes</div>
              </div>
              <button
                onClick={() => updateSettings({ ...settings, autoCreateFromTimetable: !settings.autoCreateFromTimetable })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.autoCreateFromTimetable ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.autoCreateFromTimetable ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Reminders */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-4">Reminders</h2>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Enable Reminders</div>
              <div className="text-sm text-muted-foreground">Get notified about classes and attendance</div>
            </div>
            <button
              onClick={() => updateSettings({ ...settings, remindersEnabled: !settings.remindersEnabled })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.remindersEnabled ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.remindersEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Export */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-4">Export Data</h2>
          
          <div className="space-y-3">
            <button
              onClick={handleExportPDF}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF Summary</span>
            </button>
            
            <button
              onClick={handleExportCSV}
              className="w-full flex items-center justify-center gap-2 py-3 border border-input rounded-md hover:bg-muted transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV Data</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-6 border-t border-border">
          <p>© {new Date().getFullYear()} MedAttend Pro</p>
          <p className="mt-2">
            Built with love using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
