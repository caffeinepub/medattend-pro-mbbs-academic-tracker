// Database initialization gate with extended timeout and better error recovery

import { useEffect, useState, type ReactNode } from 'react';
import { initDB } from '../storage/db';
import { Button } from './ui/button';
import { AlertCircle, RefreshCw, Database } from 'lucide-react';

interface DbInitGateProps {
  children: ReactNode;
}

type InitState = 'initializing' | 'ready' | 'error' | 'timeout';

const INIT_TIMEOUT_MS = 15000; // Extended to 15 seconds for slower networks

export default function DbInitGate({ children }: DbInitGateProps) {
  const [state, setState] = useState<InitState>('initializing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let mounted = true;

    const initialize = async () => {
      try {
        console.log(`Initializing database (attempt ${retryCount + 1})...`);
        
        // Set timeout
        timeoutId = setTimeout(() => {
          if (mounted && state === 'initializing') {
            console.error('Database initialization timeout');
            setState('timeout');
            setErrorMessage('Database initialization is taking too long. This may be caused by another tab holding the database connection or slow network conditions.');
          }
        }, INIT_TIMEOUT_MS);

        await initDB();

        if (mounted) {
          clearTimeout(timeoutId);
          console.log('Database initialized successfully');
          setState('ready');
        }
      } catch (error) {
        console.error('Database initialization error:', error);
        if (mounted) {
          clearTimeout(timeoutId);
          setState('error');
          setErrorMessage(error instanceof Error ? error.message : 'Failed to initialize database');
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [retryCount]);

  const handleRetry = () => {
    setState('initializing');
    setErrorMessage('');
    setRetryCount(prev => prev + 1);
  };

  if (state === 'ready') {
    return <>{children}</>;
  }

  if (state === 'initializing') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4 p-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <Database className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="space-y-1">
            <div className="text-foreground font-medium">Initializing database...</div>
            <div className="text-sm text-muted-foreground">This may take a few moments</div>
          </div>
        </div>
      </div>
    );
  }

  // Error or timeout state
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-6">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="w-12 h-12 text-destructive" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            {state === 'timeout' ? 'Initialization Timeout' : 'Database Error'}
          </h2>
          <p className="text-muted-foreground">
            {errorMessage}
          </p>
        </div>

        <div className="space-y-3">
          {state === 'timeout' && (
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-left space-y-2">
              <p className="font-semibold">Try these steps:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Close all other tabs with this app open</li>
                <li>Clear your browser cache and reload</li>
                <li>Try opening in a private/incognito window</li>
                <li>Check your browser's IndexedDB storage settings</li>
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleRetry}
              className="flex-1"
              size="lg"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="flex-1"
              size="lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Page
            </Button>
          </div>
          
          {retryCount > 0 && (
            <p className="text-xs text-muted-foreground">
              Retry attempt: {retryCount}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
