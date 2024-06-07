import { createTrpcContext } from "@saleor/trpc";
import * as trpcNext from "@trpc/server/adapters/next";
import { createLogger } from "../../../logger";
import { appRouter } from "../../../modules/trpc/trpc-app-router";

const logger = createLogger("trpcError");

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: createTrpcContext,
  onError: ({ path, error }) => {
    if (error.code === "INTERNAL_SERVER_ERROR") {
      logger.error({ error }, `${path} returned error:`);
      return;
    }
    logger.debug({ error }, `${path} returned error:`);
  },
});
