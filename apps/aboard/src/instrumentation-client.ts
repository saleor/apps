import * as Sentry from "@sentry/nextjs";

import { env } from "@/lib/env";

Sentry.init({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? env.NODE_ENV,
  sendDefaultPii: false,
});

// App Router only; exported so the SDK doesn't warn on every start
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
