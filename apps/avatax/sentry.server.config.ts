/*
 * This file configures the initialization of Sentry on the server.
 * The config you add here will be used whenever the server handles a request.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import { CriticalError } from "./src/error";
import { shouldExceptionLevelBeReported } from "./src/sentry-utils";
import { init, Integrations } from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT;

init({
  dsn: SENTRY_DSN,
  // Adjust this value in production, or use tracesSampler for greater control
  enableTracing: false,
  environment: SENTRY_ENVIRONMENT,
  includeLocalVariables: true,
  ignoreErrors: [
    // Ignore user configuration errors
  ],
  beforeSend(errorEvent, hint) {
    const error = hint.originalException;

    if (error instanceof CriticalError) {
      errorEvent.level = error.sentrySeverity;

      // Ignore exceptions below specified severity (warning default)
      if (!shouldExceptionLevelBeReported(errorEvent.level ?? "error")) {
        return null;
      }
    }

    // Improve grouping of CriticalError into separate issues in Sentry
    if (error instanceof CriticalError) {
      errorEvent.fingerprint = ["{{ default }}", error.message];
    }

    return errorEvent;
  },
  integrations: [
    new Integrations.LocalVariables({
      captureAllExceptions: true,
    }),
  ],
});
