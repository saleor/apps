import { createGraphQLClient, CreateGraphQLClientArgs } from "@saleor/apps-shared";
import { otelExchange } from "@saleor/apps-otel";

type CreateGraphQLClientProps = Omit<CreateGraphQLClientArgs, "opts">;

export const createInstrumentedGraphqlClient = (props: CreateGraphQLClientProps) =>
  createGraphQLClient({
    ...props,
    opts: {
      prependingFetchExchanges: [otelExchange],
    },
  });
