import * as Sentry from "@sentry/nextjs";

import { env } from "@/env";

Sentry.init({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  environment: env.ENV,
  // @vercel/otel owns the OTEL setup when enabled (./otel-node.ts). Sentry is used only for error tracking
  skipOpenTelemetrySetup: env.OTEL_ENABLED,
});
