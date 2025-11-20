import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { createLogger } from "@/lib/logger";
import { withLoggerContext } from "@/lib/logger-context";
import { createTrpcContextAppRouter } from "@/modules/trpc/context-app-router";
import { trpcRouter } from "@/modules/trpc/trpc-router";

const logger = createLogger("trpcHandler");

const handler = (request: Request) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: trpcRouter,
    createContext: createTrpcContextAppRouter,
    onError: ({ path, error }) => {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        logger.error(`${path} returned error`, {
          trpcErrorMessage: error.message,
          stack: error.cause,
          // eslint-disable-next-line @saleor/saleor-app/logger-leak
          error,
        });

        return;
      }
      logger.debug(`${path} returned error`, error);
    },
  });
};

const wrappedHandler = compose(withLoggerContext, withSpanAttributesAppRouter)(handler);

export { wrappedHandler as GET, wrappedHandler as POST };
