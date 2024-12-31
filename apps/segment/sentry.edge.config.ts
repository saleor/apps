/*
 * This file configures the initialization of Sentry on the edge.
 * The config you add here will be used whenever middleware or an Edge route handles a request.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from "@sentry/nextjs";

import { env } from "@/env";

Sentry.init({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  enableTracing: false,
  environment: env.ENV,
  includeLocalVariables: true,
  ignoreErrors: [],
  integrations: [Sentry.extraErrorDataIntegration()],
});
