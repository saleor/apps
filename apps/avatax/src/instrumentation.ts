import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      dsn: SENTRY_DSN,
      enableTracing: false,
      environment: process.env.ENV,
      includeLocalVariables: true,
      ignoreErrors: [],
      integrations: [
        Sentry.localVariablesIntegration({
          captureAllExceptions: true,
        }),
        Sentry.extraErrorDataIntegration(),
      ],
    });
  }
}
