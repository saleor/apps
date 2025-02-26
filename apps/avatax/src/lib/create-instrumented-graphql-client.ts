import { createOtelUrqlExchange } from "@saleor/apps-otel/src/otel-urql-exchange-factory";
import { createGraphQLClient, CreateGraphQLClientArgs } from "@saleor/apps-shared";

import { internalTracer } from "./otel-tracers";

type CreateGraphQLClientProps = Omit<CreateGraphQLClientArgs, "opts">;

export const createInstrumentedGraphqlClient = (props: CreateGraphQLClientProps) =>
  createGraphQLClient({
    ...props,
    opts: {
      prependingFetchExchanges: [createOtelUrqlExchange({ tracer: internalTracer })],
    },
  });
