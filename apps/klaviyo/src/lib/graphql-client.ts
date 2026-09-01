import {
  createGraphQLClient,
  type CreateGraphQLClientArgs,
} from "@saleor/apps-shared/create-graphql-client";

import packageJson from "../../package.json";

/**
 * Wraps the shared client so every Saleor request identifies this app in access logs.
 */
export const createSaleorGraphqlClient = (props: Omit<CreateGraphQLClientArgs, "userAgent">) =>
  createGraphQLClient({
    ...props,
    userAgent: `${packageJson.name}/${packageJson.version}`,
  });
