// Minimal Sentry wrapper. Replace DSN and enable @sentry/react if desired.
export function initSentry() {
  // No-op by default. Hook up Sentry here when DSN is available.
}

export function logError(error: Error, context?: Record<string, unknown>) {
  // In production, send to Sentry. For now, log to console to avoid missing env variables.
  // console.error('[Sentry]', { error, context });
  if (import.meta.env?.MODE === 'development') {
    console.warn('[Theme Error]', error?.message, context);
  }
}
