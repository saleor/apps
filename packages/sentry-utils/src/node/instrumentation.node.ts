import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enableTracing: false,
  environment: process.env.ENV,
  includeLocalVariables: true,
  skipOpenTelemetrySetup: true,
  onFatalError: onFatalErrorHandler,
  integrations: [
    Sentry.localVariablesIntegration({
      captureAllExceptions: true,
    }),
    Sentry.extraErrorDataIntegration(),
  ],
});

function onFatalErrorHandler(this: void, error: Error) {
  console.log("OnFatalError:", error);
}
