import { createHttpBatchLink } from "@saleor/trpc";
import { createTRPCNext } from "@trpc/next";

import { appBridgeInstance } from "@/pages/_app";

import { AppRouter } from "./trpc-app-router";

export const trpcClient = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [createHttpBatchLink(appBridgeInstance)],
      queryClientConfig: {
        defaultOptions: {
          queries: {
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
          },
        },
      },
    };
  },
  ssr: false,
});
