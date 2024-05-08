import * as trpcNext from "@trpc/server/adapters/next";
import { createTrpcContext } from "../../../modules/trpc/trpc-context";
import { appRouter } from "../../../modules/trpc/trpc-app-router";
import { createLogger } from "@saleor/apps-logger";
import { withOtel } from "@saleor/apps-otel";

const logger = createLogger("tRPC wrapper");

export default withOtel(
  trpcNext.createNextApiHandler({
    router: appRouter,
    createContext: createTrpcContext,
    onError: ({ path, error }) => {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        logger.error(error, `${path} returned error:`);
        return;
      }
      logger.debug(error, `${path} returned error:`);
    },
  }),
  "/api/trpc",
);
