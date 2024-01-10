import * as trpcNext from "@trpc/server/adapters/next";
import { createTrpcContext } from "../../../modules/trpc/trpc-context";
import { appRouter } from "../../../modules/trpc/trpc-app-router";
import { createLogger } from "@/logger";
import { withOtel } from "@saleor/apps-otel";

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

export default withOtel(handler, "/api/trpc");
