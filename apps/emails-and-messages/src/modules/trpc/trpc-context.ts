import * as trpcNext from "@trpc/server/adapters/next";
import { SALEOR_AUTHORIZATION_BEARER_HEADER, SALEOR_API_URL_HEADER } from "@saleor/app-sdk/const";
import { inferAsyncReturnType } from "@trpc/server";

export const createTrpcContext = async ({ res, req }: trpcNext.CreateNextContextOptions) => {
  return {
    appBridgeToken: req.headers[SALEOR_AUTHORIZATION_BEARER_HEADER] as string | undefined,
    saleorApiUrl: req.headers[SALEOR_API_URL_HEADER] as string | undefined,
  };
};

export type TrpcContext = inferAsyncReturnType<typeof createTrpcContext>;
