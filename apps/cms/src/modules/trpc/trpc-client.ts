import { SALEOR_API_URL_HEADER, SALEOR_AUTHORIZATION_BEARER_HEADER } from "@saleor/app-sdk/headers";
import { httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";

import { env } from "@/env";
import { createLogger } from "@/logger";

import { appBridgeInstance } from "../../pages/_app";
import type { AppRouter } from "./trpc-app-router";

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;

  return `http://localhost:${env.PORT}`;
}

const logger = createLogger("trpc-client");

export const trpcClient = createTRPCNext<AppRouter>({
  config({ ctx }) {
    return {
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          headers() {
            const { token, saleorApiUrl } = appBridgeInstance?.getState() || {};

            if (!token || !saleorApiUrl) {
              logger.error(
                "Can't initialize tRPC client before establishing the App Bridge connection",
              );
              throw new Error("Token and Saleor API URL unknown");
            }

            return {
              /**
               * Attach headers from app to client requests, so tRPC can add them to context
               */
              [SALEOR_AUTHORIZATION_BEARER_HEADER]: appBridgeInstance?.getState().token,
              [SALEOR_API_URL_HEADER]: appBridgeInstance?.getState().saleorApiUrl,
            };
          },
        }),
      ],
      queryClientConfig: { defaultOptions: { queries: { refetchOnWindowFocus: false } } },
    };
  },
  ssr: false,
});
