import * as Sentry from "@sentry/nextjs";

export const initSentryClient = (dsn: string | undefined) => {
  Sentry.init({
    dsn,
    enableTracing: false,
    environment: process.env.ENV,
    includeLocalVariables: true,
    ignoreErrors: ["TRPCClientError"],
    integrations: [],
  });
};
