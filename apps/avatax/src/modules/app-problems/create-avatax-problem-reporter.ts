import { type AuthData } from "@saleor/app-sdk/APL";

import { createInstrumentedGraphqlClient } from "@/lib/create-instrumented-graphql-client";

import { AvataxProblemReporter } from "./avatax-problem-reporter";

export function createAvataxProblemReporter(authData: AuthData): AvataxProblemReporter {
  const client = createInstrumentedGraphqlClient({
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
  });

  return new AvataxProblemReporter(client);
}
