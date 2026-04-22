import * as trpcNext from "@trpc/server/adapters/next";
import { appRouter } from "../../../server/routers/app-router";
import { SALEOR_AUTHORIZATION_BEARER_HEADER, SALEOR_API_URL_HEADER } from "@saleor/app-sdk/headers";
import { inferAsyncReturnType } from "@trpc/server";

/**
 * Attach headers from request to tRPC context to expose them to resolvers
 */
const createContext = async ({ res, req }: trpcNext.CreateNextContextOptions) => {
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
