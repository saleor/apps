import { SALEOR_API_URL_HEADER, SALEOR_AUTHORIZATION_BEARER_HEADER } from "@saleor/app-sdk/headers";
import { httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";

import { appBridgeInstance } from "@/pages/_app";

import type { AppRouter } from "./trpc-router";

function getBaseUrl() {
  if (typeof window !== "undefined") return "";

  return "http://localhost:3000";
}

export const trpcClient = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          headers() {
            return {
              [SALEOR_API_URL_HEADER]: appBridgeInstance?.getState().saleorApiUrl,
              [SALEOR_AUTHORIZATION_BEARER_HEADER]: appBridgeInstance?.getState().token,
            };
          },
        }),
      ],
      queryClientConfig: {
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      },
    };
  },
  ssr: false,
});
