import * as Sentry from "@sentry/nextjs";

export const initSentry = (dsn: string | undefined) => {
  Sentry.init({
    dsn,
    enableTracing: false,
    environment: process.env.ENV,
    includeLocalVariables: true,
    ignoreErrors: ["TRPCClientError"],
    integrations: [
      Sentry.localVariablesIntegration({
        captureAllExceptions: true,
      }),
      Sentry.extraErrorDataIntegration(),
    ],
  });
};
