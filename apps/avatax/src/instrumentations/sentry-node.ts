import * as Sentry from "@sentry/nextjs";

import { env } from "@/env";

Sentry.init({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  // we don't follow OTEL guide from Sentry https://docs.sentry.io/platforms/javascript/guides/nextjs/opentelemetry/custom-setup/ as we use Sentry just for error tracking
  skipOpenTelemetrySetup: true,
  environment: env.ENV,
  includeLocalVariables: true,
  integrations: [
    Sentry.localVariablesIntegration({
      captureAllExceptions: true,
    }),
    Sentry.extraErrorDataIntegration(),
  ],
});
