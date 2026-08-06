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

import { hydrateRoot, createRoot } from 'react-dom/client'
import { hydrate, type DehydratedState, type QueryClient } from '@tanstack/react-query'
import { Analytics } from '@vercel/analytics/react'
import { AppContent } from './App.tsx'
import { createAppQueryClient } from './queryClient'
import './index.css'

// Wrap the application with Sentry's error boundary.
const SentryApp = Sentry.withErrorBoundary(
  ({ queryClient }: { queryClient: QueryClient }) => (
    <AppContent queryClient={queryClient} />
  ),
  {
    fallback: ({ resetError }) => (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Something went wrong.</h2>
        <button onClick={resetError}>Try again</button>
      </div>
    ),
  }
)

const root = document.getElementById('root')!

type PrerenderPayload = {
  queryState?: DehydratedState
}

function readPrerenderPayload(): PrerenderPayload | null {
  const element = document.getElementById('prerender-data')
  if (!element?.textContent) return null

  try {
    const payload = JSON.parse(element.textContent) as PrerenderPayload
    element.remove()
    return payload && typeof payload === 'object' ? payload : null
  } catch {
    element.remove()
    return null
  }
}

const prerenderPayload = readPrerenderPayload()
const queryClient = createAppQueryClient()
if (prerenderPayload?.queryState) {
  hydrate(queryClient, prerenderPayload.queryState)
}

const app = (
  <>
    <SentryApp queryClient={queryClient} />
    <Analytics />
  </>
)

if (root.hasChildNodes()) {
  hydrateRoot(root, app)
} else {
  createRoot(root).render(app)
}
