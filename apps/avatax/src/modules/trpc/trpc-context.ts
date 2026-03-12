import { SALEOR_API_URL_HEADER, SALEOR_AUTHORIZATION_BEARER_HEADER } from "@saleor/app-sdk/headers";
import { type inferAsyncReturnType } from "@trpc/server";
import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

export const createTrpcContext = async ({ req }: FetchCreateContextFnOptions) => {
  return {
    token: req.headers.get(SALEOR_AUTHORIZATION_BEARER_HEADER) as string | undefined,
    saleorApiUrl: req.headers.get(SALEOR_API_URL_HEADER) as string | undefined,
    appId: undefined as undefined | string,
  };
};

export type TrpcContext = inferAsyncReturnType<typeof createTrpcContext>;
