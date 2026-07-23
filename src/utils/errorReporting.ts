/**
 * Central error reporting hook.
 *
 * This intentionally has zero external dependencies so it works before a
 * crash reporter (Sentry, Bugsnag, etc.) is wired up. Every call site in the
 * app — the ErrorBoundary, the global JS error handler, and the unhandled
 * promise rejection tracker — should funnel through here so we have exactly
 * one place to swap in real telemetry.
 */

export interface ErrorReportContext {
  /** Where the error was captured, e.g. "ErrorBoundary", "GlobalHandler". */
  source: string;
  /** React component stack, if available. */
  componentStack?: string;
  /** True if the JS engine considers this fatal (app is about to die). */
  isFatal?: boolean;
  [key: string]: unknown;
}

export function reportError(error: Error, context: ErrorReportContext): void {
  // Always log — in production this still lands in native device logs
  // (adb logcat / Xcode console) and CI/E2E log capture, so it's not a
  // no-op even without a crash reporter attached yet.
  // eslint-disable-next-line no-console
  console.error(`[${context.source}]`, error, context);

  if (!__DEV__) {
    // TODO: wire up a real crash reporter, e.g.:
    // Sentry.captureException(error, { extra: context, level: context.isFatal ? 'fatal' : 'error' });
    // Keep this block side-effect only — it must never throw, or it can
    // mask the original error / crash the crash handler itself.
  }
}
