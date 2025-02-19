import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import * as Sentry from "@sentry/nextjs";
import * as trpcNext from "@trpc/server/adapters/next";

import { wrapWithSpanAttrs } from "@/lib/wrap-with-span-attrs";

import { createLogger } from "../../../logger";
import { loggerContext } from "../../../logger-context";
import { appRouter } from "../../../modules/trpc/trpc-app-router";
import { createTrpcContext } from "../../../modules/trpc/trpc-context";

const logger = createLogger("tRPC error");

export default wrapWithLoggerContext(
  wrapWithSpanAttrs(
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
