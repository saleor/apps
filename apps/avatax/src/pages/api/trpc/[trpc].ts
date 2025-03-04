import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared";
import * as Sentry from "@sentry/nextjs";
import * as trpcNext from "@trpc/server/adapters/next";

import { createLogger } from "../../../logger";
import { withLoggerContext } from "../../../logger-context";
import { appRouter } from "../../../modules/trpc/trpc-app-router";
import { createTrpcContext } from "../../../modules/trpc/trpc-context";

const logger = createLogger("tRPC error");

const handler = trpcNext.createNextApiHandler({
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
});

export default compose(withLoggerContext, withSpanAttributes)(handler);
