import { createHttpBatchLink } from "@saleor/apps-trpc/http-batch-link";
import { httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";

import { appBridgeInstance } from "@/pages/_app";

import { TrpcRouter } from "./trpc-router";

export const trpcClient = createTRPCNext<TrpcRouter>({
  config() {
    // For WSM admin routes, use a simple HTTP link without app bridge requirements
    // This allows accessing /wsm-admin without Saleor context
    const isWsmAdminRoute = typeof window !== 'undefined' && window.location.pathname.includes('/wsm-admin');

    const link = isWsmAdminRoute
      ? httpBatchLink({
          url: '/api/trpc',
        })
      : createHttpBatchLink(appBridgeInstance);

    return {
      links: [link],
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
