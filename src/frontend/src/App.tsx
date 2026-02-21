// Root application component with robust IndexedDB initialization and error boundaries

import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import DbInitGate from './components/DbInitGate';
import { useEffect } from 'react';

export default function App() {
  // Log app initialization for debugging deployment issues
  useEffect(() => {
    console.log('MedAttend Pro app initialized');
    console.log('Environment:', import.meta.env.MODE);
  }, []);

  return (
    <DbInitGate>
      <RouterProvider router={router} />
    </DbInitGate>
  );
}
