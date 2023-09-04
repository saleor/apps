import { AppBridge } from "@saleor/app-sdk/app-bridge";
import { SALEOR_API_URL_HEADER, SALEOR_AUTHORIZATION_BEARER_HEADER } from "@saleor/app-sdk/const";
import { httpBatchLink } from "@trpc/client";

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  // eslint-disable-next-line turbo/no-undeclared-env-vars
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const createHttpBatchLink = (appBridgeInstance?: AppBridge) => {
  return httpBatchLink({
    url: `${getBaseUrl()}/api/trpc`,
    headers() {
      const { token, saleorApiUrl } = appBridgeInstance?.getState() || {};

      if (!token || !saleorApiUrl) {
        console.error("Can't initialize tRPC client before establishing the App Bridge connection");
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
  });
};
