import * as Sentry from "@sentry/nextjs";

import { env } from "@/env";

Sentry.init({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  environment: env.ENV,
  skipOpenTelemetrySetup: true,
  includeLocalVariables: true,
  ignoreErrors: ["TRPCClientError"],
  integrations: [],
});
