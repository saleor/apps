import { SALEOR_API_URL_HEADER, SALEOR_AUTHORIZATION_BEARER_HEADER } from "@saleor/app-sdk/headers";
import { httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";

import { env } from "@/env";

import { appBridgeInstance } from "./pages/_app";
import { type AppRouter } from "./server/routers/app-router";

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;

  return `http://localhost:${env.PORT}`;
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
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  ssr: true,
});
