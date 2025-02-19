import { otelExchange } from "@saleor/apps-otel/src/otel-exchange";
import { createGraphQLClient, CreateGraphQLClientArgs } from "@saleor/apps-shared";

type CreateGraphQLClientProps = Omit<CreateGraphQLClientArgs, "opts">;

export const createInstrumentedGraphqlClient = (props: CreateGraphQLClientProps) =>
  createGraphQLClient({
    ...props,
    opts: {
      prependingFetchExchanges: [otelExchange],
    },
  });
