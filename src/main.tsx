import * as Sentry from '@sentry/react';

// Initialize Sentry before any other imports
Sentry.init({
  dsn: 'https://afe29a92f62bea42769abe4a9207df9e@o4511329239367680.ingest.de.sentry.io/4511329282359376',
  environment: import.meta.env.MODE || 'development',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Performance monitoring
  tracesSampler: (samplingContext) => {
    // Sample rate for transactions
    if (samplingContext.name?.includes('/api/')) {
      return 0.1; // Lower sample rate for API calls
    }
    return 0.3; // 30% sample rate for other transactions
  },
  // Session replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
});

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Wrap App with Sentry error boundary
const SentryApp = Sentry.withErrorBoundary(App, {
  fallback: ({ error, resetError }) => (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Something went wrong.</h2>
      <button onClick={resetError}>Try again</button>
    </div>
  ),
});

createRoot(document.getElementById("root")!).render(<SentryApp />);
