import * as trpcNext from "@trpc/server/adapters/next";
import { createTrpcContext } from "../../../modules/trpc/trpc-context";
import { appRouter } from "../../../modules/trpc/trpc-app-router";

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: createTrpcContext,
});
