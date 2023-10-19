/*
 * This file configures the initialization of Sentry on the server.
 * The config you add here will be used whenever the server handles a request.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from "@sentry/nextjs";
import { CriticalError } from "./src/error";
import { TaxError } from "./src/modules/taxes/tax-error";
import { shouldExceptionLevelBeReported } from "./src/sentry-utils";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT;

Sentry.init({
  dsn: SENTRY_DSN,
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
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

    // Improve grouping of TaxError into separate issues in Sentry
    if (error instanceof TaxError) {
      errorEvent.fingerprint = ["{{ default }}", error.message];
    }

    return errorEvent;
  },
  integrations: [
    new Sentry.Integrations.LocalVariables({
      captureAllExceptions: true,
    }),
  ],
});
