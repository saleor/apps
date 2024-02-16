import { CreateGraphQLClientArgs, createGraphQLClient, createExchange } from "@saleor/apps-shared";

import { otelExchangeHandlers } from "@saleor/apps-otel";

export const otelExchange = createExchange(
  otelExchangeHandlers.onOperation,
  otelExchangeHandlers.onResult,
);

type CreateGraphQLClientProps = Omit<CreateGraphQLClientArgs, "opts">;

export const createInstrumentedGraphqlClient = (props: CreateGraphQLClientProps) =>
  createGraphQLClient({
    ...props,
    opts: {
      exchange: otelExchange,
    },
  });
