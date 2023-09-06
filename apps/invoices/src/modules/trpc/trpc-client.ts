import { createTRPCNext } from "@trpc/next";

import { createHttpBatchLink } from "@saleor/trpc";
import { appBridgeInstance } from "../../pages/_app";
import { AppRouter } from "./trpc-app-router";

export const trpcClient = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [createHttpBatchLink(appBridgeInstance)],
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  ssr: false,
});
