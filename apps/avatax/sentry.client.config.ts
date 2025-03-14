/*
 * This file configures the initialization of Sentry on the browser.
 * The config you add here will be used whenever a page is visited.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from "@sentry/nextjs";

import { env } from "@/env";

Sentry.init({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  skipOpenTelemetrySetup: true,
  environment: env.ENV,
  includeLocalVariables: true,
  ignoreErrors: ["TRPCClientError"],
  integrations: [],
});
