import * as trpcNext from "@trpc/server/adapters/next";
import { SALEOR_AUTHORIZATION_BEARER_HEADER, SALEOR_API_URL_HEADER } from "@saleor/app-sdk/const";
import { inferAsyncReturnType } from "@trpc/server";
import { getAppBaseUrl } from "@saleor/apps-shared";

export const createTrpcContext = async ({ res, req }: trpcNext.CreateNextContextOptions) => {
  const baseUrl = getAppBaseUrl(req.headers);

  return {
    token: req.headers[SALEOR_AUTHORIZATION_BEARER_HEADER] as string | undefined,
    saleorApiUrl: req.headers[SALEOR_API_URL_HEADER] as string | undefined,
    appId: undefined as undefined | string,
    ssr: undefined as undefined | boolean,
    baseUrl,
  };
};

export type TrpcContext = inferAsyncReturnType<typeof createTrpcContext>;
