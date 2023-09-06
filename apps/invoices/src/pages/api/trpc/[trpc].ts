import * as trpcNext from "@trpc/server/adapters/next";
import { appRouter } from "../../../modules/trpc/trpc-app-router";
import { createLogger } from "@saleor/apps-shared";
import { createTrpcContext } from "@saleor/trpc";

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
