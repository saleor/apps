import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";
import * as trpcNext from "@trpc/server/adapters/next";

import { createLogger } from "../../../logger";
import { loggerContext } from "../../../logger-context";
import { appRouter } from "../../../modules/trpc/trpc-app-router";
import { createTrpcContext } from "../../../modules/trpc/trpc-context";

const logger = createLogger("tRPC wrapper");

export default wrapWithLoggerContext(
  withSpanAttributes(
    trpcNext.createNextApiHandler({
      router: appRouter,
      createContext: createTrpcContext,
      onError: ({ path, error }) => {
        const errorDetails = {
          error: {
            code: error.code,
            message: error.message,
            cause: error.cause,
          },
        };

        if (error.code === "INTERNAL_SERVER_ERROR") {
          logger.error(`${path} returned error:`, errorDetails);

          return;
        }
        logger.debug(`${path} returned error:`, errorDetails);
      },
    }),
  ),
  loggerContext,
);
