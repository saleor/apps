import { type AuthData } from "@saleor/app-sdk/APL";

import { createInstrumentedGraphqlClient } from "@/modules/trpc/create-instrumented-graphql-client";

import { CmsProblemReporter } from "./cms-problem-reporter";

export function createCmsProblemReporter(authData: AuthData): CmsProblemReporter {
  const client = createInstrumentedGraphqlClient({
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
  });

  return new CmsProblemReporter(client);
}
