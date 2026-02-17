// Main app layout with bottom navigation

import { Outlet } from '@tanstack/react-router';
import BottomNav from './BottomNav';
import { useSettings } from '../hooks/useLocalStore';
import { useEffect } from 'react';

export default function AppLayout() {
  const { settings } = useSettings();

  useEffect(() => {
    if (settings?.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings?.darkMode]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Outlet />
      <BottomNav />
    </div>
  );
}
