import { createProtectedHandler } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";
import * as trpcNext from "@trpc/server/adapters/next";

import { createLogger } from "../../../logger";
import { loggerContext } from "../../../logger-context";
import { appRouter } from "../../../modules/trpc/trpc-app-router";
import { createTrpcContext } from "../../../modules/trpc/trpc-context";
import { saleorApp } from "../../../saleor-app";

const logger = createLogger("tRPC error");

const handler = trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: createTrpcContext,
  onError: ({ path, error }) => {
    if (error.code === "INTERNAL_SERVER_ERROR") {
      logger.error(`${path} returned error:`, { error });
      return;
    }
    logger.debug(`${path} returned error:`, { error });
  },
});

export default createProtectedHandler(
  wrapWithLoggerContext(withOtel(handler, "/api/trpc"), loggerContext),
  saleorApp.apl,
  ["MANAGE_APPS"],
);
