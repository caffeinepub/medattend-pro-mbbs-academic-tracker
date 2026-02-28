// Route configuration

import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import DashboardPage from './pages/DashboardPage';
import AddClassPage from './pages/AddClassPage';
import TimetablePage from './pages/TimetablePage';
import RecordsPage from './pages/RecordsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import AppLayout from './components/AppLayout';

const rootRoute = createRootRoute({
  component: AppLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const addClassRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/add-class',
  component: AddClassPage,
});

const timetableRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/timetable',
  component: TimetablePage,
});

const recordsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/records',
  component: RecordsPage,
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analytics',
  component: AnalyticsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  addClassRoute,
  timetableRoute,
  recordsRoute,
  analyticsRoute,
  settingsRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
