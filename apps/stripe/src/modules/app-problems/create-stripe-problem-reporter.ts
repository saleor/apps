import { type AuthData } from "@saleor/app-sdk/APL";

import { createInstrumentedGraphqlClient } from "@/lib/graphql-client";

import { StripeProblemReporter } from "./stripe-problem-reporter";

export function createStripeProblemReporter(authData: AuthData): StripeProblemReporter {
  const client = createInstrumentedGraphqlClient(authData);

  return new StripeProblemReporter(client);
}
