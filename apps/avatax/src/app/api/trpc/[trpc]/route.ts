import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { createLogger } from "@/logger";
import { withLoggerContext } from "@/logger-context";
import { appRouter } from "@/modules/trpc/trpc-app-router";
import { createTrpcContext } from "@/modules/trpc/trpc-context";

const logger = createLogger("tRPC error");

const handler = (request: Request) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: createTrpcContext,
    onError: ({ path, error }) => {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        logger.error(`${path} returned error:`, error);
        return;
      }
      logger.debug(`${path} returned error:`, error);
    },
  });
};

export const GET = compose(withLoggerContext, withSpanAttributesAppRouter)(handler);
export const POST = compose(withLoggerContext, withSpanAttributesAppRouter)(handler);
