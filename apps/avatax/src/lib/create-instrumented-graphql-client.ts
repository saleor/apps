import { createOtelUrqlExchange } from "@saleor/apps-otel/otel-urql-exchange-factory";
import { createGraphQLClient, CreateGraphQLClientArgs } from "@saleor/apps-shared";

import { appRootTracer } from "./app-root-tracer";

type CreateGraphQLClientProps = Omit<CreateGraphQLClientArgs, "opts">;

export const createInstrumentedGraphqlClient = (props: CreateGraphQLClientProps) =>
  createGraphQLClient({
    ...props,
    opts: {
      prependingFetchExchanges: [createOtelUrqlExchange({ tracer: appRootTracer })],
    },
  });
