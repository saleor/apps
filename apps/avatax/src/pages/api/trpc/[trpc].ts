import * as trpcNext from "@trpc/server/adapters/next";
import { appRouter } from "../../../modules/trpc/trpc-app-router";
import { createTrpcContext } from "../../../modules/trpc/trpc-context";
import { createLogger } from "@saleor/apps-shared";
import { withOtel } from "@saleor/apps-otel";

const logger = createLogger({ name: "tRPC error" });

export default withOtel(
  trpcNext.createNextApiHandler({
    router: appRouter,
    createContext: createTrpcContext,
    onError: ({ path, error }) => {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        logger.error(`${path} returned error:`, error);
        return;
      }
      logger.debug(`${path} returned error:`, error);
    },
  }),
  "api/trpc",
);
