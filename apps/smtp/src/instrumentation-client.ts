import * as Sentry from "@sentry/nextjs";

import { env } from "./env";

Sentry.init({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  environment: env.ENV,
  ignoreErrors: ["TRPCClientError"],
});

// App Router only; exported so the SDK doesn't warn on every start
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
