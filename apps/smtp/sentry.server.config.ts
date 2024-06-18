import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enableTracing: false,
  environment: process.env.ENV,
  includeLocalVariables: true,
});
