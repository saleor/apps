import * as Sentry from "@sentry/nextjs";

import { env } from "@/lib/env";

Sentry.init({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  environment: env.ENV,
  // we don't follow OTEL guide from Sentry https://docs.sentry.io/platforms/javascript/guides/nextjs/opentelemetry/custom-setup/ as we use Sentry just for error tracking
  skipOpenTelemetrySetup: true,
  includeLocalVariables: true,
  ignoreErrors: ["TRPCClientError"],
  integrations: [],
});
