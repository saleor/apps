import { withOtel } from "@saleor/apps-otel";
import * as trpcNext from "@trpc/server/adapters/next";
import { createLogger } from "../../../logger";
import { appRouter } from "../../../modules/trpc/trpc-app-router";
import { createTrpcContext } from "../../../modules/trpc/trpc-context";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { loggerContext } from "../../../logger-context";

const logger = createLogger("tRPC wrapper");

export default wrapWithLoggerContext(
  withOtel(
    trpcNext.createNextApiHandler({
      router: appRouter,
      createContext: createTrpcContext,
      onError: ({ path, error }) => {
        if (error.code === "INTERNAL_SERVER_ERROR") {
          logger.error(`${path} returned error:`, { error });
          return;
        }
        logger.debug(`${path} returned error:`, { error });
      },
    }),
    "/api/trpc",
  ),
  loggerContext,
);
