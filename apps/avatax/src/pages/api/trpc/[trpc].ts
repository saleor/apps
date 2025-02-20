import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { wrapWithSpanAttributes } from "@saleor/apps-otel/src/wrap-with-span-attributes";
import * as Sentry from "@sentry/nextjs";
import * as trpcNext from "@trpc/server/adapters/next";

import { createLogger } from "../../../logger";
import { loggerContext } from "../../../logger-context";
import { appRouter } from "../../../modules/trpc/trpc-app-router";
import { createTrpcContext } from "../../../modules/trpc/trpc-context";

const logger = createLogger("tRPC error");

export default wrapWithLoggerContext(
  wrapWithSpanAttributes(
    trpcNext.createNextApiHandler({
      /**
       * TODO: Add middleware that verifies permissions
       */
      router: appRouter,
      createContext: createTrpcContext,
      onError: ({ path, error }) => {
        if (error.code === "INTERNAL_SERVER_ERROR") {
          Sentry.captureException(error);
          logger.error(`${path} returned error:`, error);
          return;
        }
        logger.debug(`${path} returned error:`, error);
      },
    }),
  ),
  loggerContext,
);
