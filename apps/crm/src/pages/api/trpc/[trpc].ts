import * as trpcNext from "@trpc/server/adapters/next";
import { createLogger } from "../../../logger";
import { appRouter } from "../../../modules/trpc/trpc-app-router";
import { createTrpcContext } from "../../../modules/trpc/trpc-context";

const logger = createLogger("trpcError");

export default trpcNext.createNextApiHandler({
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
