// Root application component with robust IndexedDB initialization

import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import DbInitGate from './components/DbInitGate';

export default function App() {
  return (
    <DbInitGate>
      <RouterProvider router={router} />
    </DbInitGate>
  );
}
