"use client";

import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { createGraphQLClient } from "@saleor/apps-shared/create-graphql-client";
import { type PropsWithChildren, useMemo, useRef } from "react";
import { Provider } from "urql";

/**
 * Stable placeholder so the tree can paint before AppBridge has a Saleor API URL.
 * Queries stay paused until a token exists.
 */
const pendingClient = createGraphQLClient({ saleorApiUrl: "https://pending.invalid/graphql/" });

/**
 * Recreate only when the shop URL changes or the first token arrives.
 * The token is read from a ref per request, so AppBridge `tokenRefresh` keeps the client
 * and its cache (no skeleton flash).
 */
export const GraphQLProvider = ({ children }: PropsWithChildren) => {
  const { appBridgeState } = useAppBridge();
  const saleorApiUrl = appBridgeState?.saleorApiUrl;
  const token = appBridgeState?.token;
  const hasToken = Boolean(token);
  const tokenRef = useRef(token);

  tokenRef.current = token;

  const client = useMemo(() => {
    if (!saleorApiUrl || !hasToken) {
      return pendingClient;
    }

    return createGraphQLClient({ saleorApiUrl, token: () => tokenRef.current });
  }, [saleorApiUrl, hasToken]);

  return <Provider value={client}>{children}</Provider>;
};
