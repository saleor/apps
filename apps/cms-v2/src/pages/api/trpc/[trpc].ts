import * as trpcNext from "@trpc/server/adapters/next";
import { createTrpcContext } from "../../../modules/trpc/trpc-context";
import { appRouter } from "../../../modules/trpc/trpc-app-router";
import { createLogger } from "@saleor/apps-shared";
import { withOtel } from "@saleor/apps-otel";

const logger = createLogger({ name: "tRPC error" });

const handler = trpcNext.createNextApiHandler({
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

export default withOtel(handler, "/api/trpc");
