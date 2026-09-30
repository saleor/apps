import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.ENV,
  // @vercel/otel owns the OTEL setup when enabled (./otel-node.ts). Sentry is used only for error tracking
  skipOpenTelemetrySetup: process.env.OTEL_ENABLED === "true",
});
