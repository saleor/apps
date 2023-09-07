import * as trpcNext from "@trpc/server/adapters/next";

import { appRouter } from "../../../modules/trpc/trpc-app-router";
import { createTrpcContext } from "@saleor/trpc";

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: createTrpcContext,
});
