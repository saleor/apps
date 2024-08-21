import { SALEOR_API_URL_HEADER, SALEOR_AUTHORIZATION_BEARER_HEADER } from "@saleor/app-sdk/const";
import { inferAsyncReturnType } from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";

export const createTrpcContext = async ({ res, req }: trpcNext.CreateNextContextOptions) => {
  return {
    token: req.headers[SALEOR_AUTHORIZATION_BEARER_HEADER] as string | undefined,
    saleorApiUrl: req.headers[SALEOR_API_URL_HEADER] as string | undefined,
    appId: undefined as undefined | string,
  };
};

export type TrpcContext = inferAsyncReturnType<typeof createTrpcContext>;
