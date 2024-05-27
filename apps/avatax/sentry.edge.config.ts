/*
 * This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
 * The config you add here will be used whenever one of the edge features is loaded.
 * Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from "@sentry/nextjs";
import { BaseError, CriticalError } from "./src/error";
import { shouldExceptionLevelBeReported } from "./src/sentry-utils";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  enableTracing: false,
  environment: process.env.ENV,
  includeLocalVariables: true,
  beforeSend(errorEvent, hint) {
    const error = hint.originalException;

    if (error instanceof CriticalError) {
      errorEvent.level = error.sentrySeverity;

      // Ignore exceptions below specified severity (warning default)
      if (!shouldExceptionLevelBeReported(errorEvent.level ?? "error")) {
        return null;
      }
    }

    if (error instanceof BaseError) {
      errorEvent.fingerprint = ["{{ default }}", error.message];
    }

    return errorEvent;
  },
  integrations: [
    Sentry.localVariablesIntegration({
      captureAllExceptions: true,
    }),
    Sentry.extraErrorDataIntegration(),
  ],
});
