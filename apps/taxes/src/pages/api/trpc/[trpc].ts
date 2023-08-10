import * as trpcNext from "@trpc/server/adapters/next";
import { appRouter } from "../../../modules/trpc/trpc-app-router";
import { createTrpcContext } from "../../../modules/trpc/trpc-context";
import { createLogger } from "@saleor/apps-shared";

const logger = createLogger({ name: "tRPC error" });

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: createTrpcContext,
  onError: ({ path, error }) => {
    if (error.code === "INTERNAL_SERVER_ERROR") {
      logger.error(error, `${path} returned error:`);
      return;
    }
    logger.debug(error, `${path} returned error:`);
  },
});
