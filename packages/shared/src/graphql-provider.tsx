"use client";

import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { PropsWithChildren } from "react";
import { Provider } from "urql";

import { createGraphQLClient } from "./create-graphql-client";

export function GraphQLProvider(props: PropsWithChildren<unknown>) {
  const { appBridgeState } = useAppBridge();

  if (!appBridgeState?.saleorApiUrl) {
    return <div {...props}></div>;
  }

  const client = createGraphQLClient({
    saleorApiUrl: appBridgeState.saleorApiUrl,
    token: appBridgeState.token,
  });

  return <Provider value={client} {...props} />;
}
