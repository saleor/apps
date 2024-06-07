import { withOtel } from "@saleor/apps-otel";
import * as trpcNext from "@trpc/server/adapters/next";
import { createLogger } from "../../../logger";
import { appRouter } from "../../../modules/trpc/trpc-app-router";
import { createTrpcContext } from "../../../modules/trpc/trpc-context";

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
