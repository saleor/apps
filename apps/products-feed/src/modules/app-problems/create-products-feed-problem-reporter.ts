import { type AuthData } from "@saleor/app-sdk/APL";

import { createInstrumentedGraphqlClient } from "@/lib/create-instrumented-graphql-client";

import { ProductsFeedProblemReporter } from "./products-feed-problem-reporter";

export function createProductsFeedProblemReporter(authData: AuthData): ProductsFeedProblemReporter {
  const client = createInstrumentedGraphqlClient({
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
  });

  return new ProductsFeedProblemReporter(client);
}
