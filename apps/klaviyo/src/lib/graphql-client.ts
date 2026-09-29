import { createOtelUrqlExchange } from "@saleor/apps-otel/src/otel-urql-exchange-factory";
import {
  createGraphQLClient,
  type CreateGraphQLClientArgs,
} from "@saleor/apps-shared/create-graphql-client";

import packageJson from "../../package.json";
import { appRootTracer } from "./app-root-tracer";

/**
 * Wraps the shared client so every Saleor request identifies this app in access logs and is traced.
 */
export const createSaleorGraphqlClient = (
  props: Omit<CreateGraphQLClientArgs, "opts" | "userAgent">,
) =>
  createGraphQLClient({
    ...props,
    userAgent: `${packageJson.name}/${packageJson.version}`,
    opts: {
      prependingFetchExchanges: [createOtelUrqlExchange({ tracer: appRootTracer })],
    },
  });
