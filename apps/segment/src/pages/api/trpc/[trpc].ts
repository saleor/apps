import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";
import * as Sentry from "@sentry/nextjs";
import * as trpcNext from "@trpc/server/adapters/next";

import { loggerContext } from "@/logger-context";
import { appRouter } from "@/modules/trpc/trpc-app-router";
import { createTrpcContext } from "@/modules/trpc/trpc-context";

export default wrapWithLoggerContext(
  withOtel(
    trpcNext.createNextApiHandler({
      router: appRouter,
      createContext: createTrpcContext,
      onError: ({ error }) => {
        if (error.code === "INTERNAL_SERVER_ERROR") {
          Sentry.captureException(error);
          return;
        }
      },
    }),
    "/api/trpc",
  ),
  loggerContext,
);
