import { CreateGraphQLClientArgs, createGraphQLClient } from "@saleor/apps-shared";
import { otelExchange } from "..";

type CreateGraphQLClientProps = Omit<CreateGraphQLClientArgs, "opts">;

export const createInstrumentedGraphqlClient = (props: CreateGraphQLClientProps) =>
  createGraphQLClient({
    ...props,
    opts: {
      prependingFetchExchanges: [otelExchange],
    },
  });
