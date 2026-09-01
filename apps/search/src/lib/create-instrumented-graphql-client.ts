import { createOtelUrqlExchange } from "@saleor/apps-otel/src/otel-urql-exchange-factory";
import {
  createGraphQLClient,
  type CreateGraphQLClientArgs,
} from "@saleor/apps-shared/create-graphql-client";

import packageJson from "../../package.json";
import { appRootTracer } from "./app-root-tracer";

type CreateGraphQLClientProps = Omit<CreateGraphQLClientArgs, "opts" | "userAgent">;

export const createInstrumentedGraphqlClient = (props: CreateGraphQLClientProps) =>
  createGraphQLClient({
    ...props,
    userAgent: `${packageJson.name}/${packageJson.version}`,
    opts: {
      prependingFetchExchanges: [createOtelUrqlExchange({ tracer: appRootTracer })],
    },
  });
