import { type AuthData } from "@saleor/app-sdk/APL";

import { createInstrumentedGraphqlClient } from "@/lib/create-instrumented-graphql-client";

import { SegmentProblemReporter } from "./segment-problem-reporter";

export function createSegmentProblemReporter(authData: AuthData): SegmentProblemReporter {
  const client = createInstrumentedGraphqlClient({
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
  });

  return new SegmentProblemReporter(client);
}
