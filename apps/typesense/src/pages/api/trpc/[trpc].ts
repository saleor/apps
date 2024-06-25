import * as trpcNext from "@trpc/server/adapters/next";
import { createTrpcContext } from "../../../modules/trpc/trpc-context";
import { appRouter } from "../../../modules/trpc/trpc-app-router";
import { withOtel } from "@saleor/apps-otel";

export default withOtel(
  trpcNext.createNextApiHandler({
    router: appRouter,
    createContext: createTrpcContext,
  }),
  "api/trpc",
);
