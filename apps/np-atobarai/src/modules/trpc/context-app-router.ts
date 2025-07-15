import { SALEOR_API_URL_HEADER, SALEOR_AUTHORIZATION_BEARER_HEADER } from "@saleor/app-sdk/headers";
import { inferAsyncReturnType } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { Client } from "urql";

import { appConfigRepo } from "@/modules/app-config/repo/app-config-repo";

export const createTrpcContextAppRouter = async ({ req }: FetchCreateContextFnOptions) => {
  return {
    token: req.headers.get(SALEOR_AUTHORIZATION_BEARER_HEADER) as string | undefined,
    saleorApiUrl: req.headers.get(SALEOR_API_URL_HEADER) as string | undefined,
    appId: undefined as undefined | string,
    apiClient: null as Client | null,
    appUrl: req.headers.get("origin"),
    configRepo: appConfigRepo,
  };
};

export type TrpcContextAppRouter = inferAsyncReturnType<typeof createTrpcContextAppRouter>;
