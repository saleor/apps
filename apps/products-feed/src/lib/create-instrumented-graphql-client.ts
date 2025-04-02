import { createOtelUrqlExchange } from "@saleor/apps-otel/src/otel-urql-exchange-factory";
import {
  createGraphQLClient,
  CreateGraphQLClientArgs,
} from "@saleor/apps-shared/create-graphql-client";

import { appRootTracer } from "./app-root-tracer";

type CreateGraphQLClientProps = Omit<CreateGraphQLClientArgs, "opts">;

export const createInstrumentedGraphqlClient = (props: CreateGraphQLClientProps) =>
  createGraphQLClient({
    ...props,
    opts: {
      prependingFetchExchanges: [createOtelUrqlExchange({ tracer: appRootTracer })],
    },
  });
