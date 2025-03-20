import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.ENV,
  // we don't follow OTEL guide from Sentry https://docs.sentry.io/platforms/javascript/guides/nextjs/opentelemetry/custom-setup/ as we use Sentry just for error tracking
  skipOpenTelemetrySetup: true,
  includeLocalVariables: true,
  integrations: [
    Sentry.localVariablesIntegration({
      captureAllExceptions: true,
    }),
    Sentry.extraErrorDataIntegration(),
  ],
});
