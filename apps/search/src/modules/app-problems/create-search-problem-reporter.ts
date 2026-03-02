import { type AuthData } from "@saleor/app-sdk/APL";

import { createInstrumentedGraphqlClient } from "../../lib/create-instrumented-graphql-client";
import { SearchProblemReporter } from "./search-problem-reporter";

export function createSearchProblemReporter(authData: AuthData): SearchProblemReporter {
  const client = createInstrumentedGraphqlClient({
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
  });

  return new SearchProblemReporter(client);
}
