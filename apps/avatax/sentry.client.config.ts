/*
 * This file configures the initialization of Sentry on the browser.
 * The config you add here will be used whenever a page is visited.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from "@sentry/nextjs";
import { CriticalError } from "./src/error";
import { shouldExceptionLevelBeReported } from "./src/sentry-utils";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT;

Sentry.init({
  dsn: SENTRY_DSN,
  enableTracing: false,
  environment: SENTRY_ENVIRONMENT,
  includeLocalVariables: true,
  ignoreErrors: ["TRPCClientError"],
  beforeSend(errorEvent, hint) {
    const error = hint.originalException;

    if (error instanceof CriticalError) {
      errorEvent.level = error.sentrySeverity;

      // Ignore exceptions below specified severity (warning default)
      if (!shouldExceptionLevelBeReported(errorEvent.level ?? "error")) {
        return null;
      }
    }

    return errorEvent;
  },
  integrations: [],
});
