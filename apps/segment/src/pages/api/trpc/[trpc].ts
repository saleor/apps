import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";
import * as Sentry from "@sentry/nextjs";
import * as trpcNext from "@trpc/server/adapters/next";

import { loggerContext } from "@/logger-context";
import { appRouter } from "@/modules/trpc/trpc-app-router";
import { createTrpcContext } from "@/modules/trpc/trpc-context";

export default wrapWithLoggerContext(
  withSpanAttributes(
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
  ),
  loggerContext,
);
