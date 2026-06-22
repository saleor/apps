import { SALEOR_API_URL_HEADER, SALEOR_AUTHORIZATION_BEARER_HEADER } from "@saleor/app-sdk/headers";
import { type inferAsyncReturnType } from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";

import { appRouter } from "../../../server/routers/app-router";

/**
 * Attach headers from request to tRPC context to expose them to resolvers
 */
const createContext = async ({ req }: trpcNext.CreateNextContextOptions) => {
  const token = req.headers[SALEOR_AUTHORIZATION_BEARER_HEADER];
  const saleorApiUrl = req.headers[SALEOR_API_URL_HEADER];

  return {
    token: Array.isArray(token) ? token[0] : token,
    saleorApiUrl: Array.isArray(saleorApiUrl) ? saleorApiUrl[0] : saleorApiUrl,
  };
};

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
});

export type Context = inferAsyncReturnType<typeof createContext>;
