"use client";

import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { type PropsWithChildren, useMemo, useRef } from "react";
import { cacheExchange, createClient, fetchExchange, Provider } from "urql";

/**
 * Stable placeholder so the tree can paint before AppBridge has a Saleor API URL.
 * Queries stay paused until a token exists.
 */
const pendingClient = createClient({
  url: "https://pending.invalid/graphql/",
  exchanges: [cacheExchange, fetchExchange],
});

/**
 * Local urql client — do not use shared `createGraphQLClient` here.
 * That helper closes over the JWT at construction time, so AppBridge
 * `tokenRefresh` would require a new client and drop the cache (skeleton flash).
 *
 * Recreate only when the shop URL changes or the first token arrives.
 * Auth headers are read from a ref per request.
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

    return createClient({
      url: saleorApiUrl,
      fetchOptions: () => {
        const authToken = tokenRef.current;

        return authToken ? { headers: { "Authorization-Bearer": authToken } } : {};
      },
      exchanges: [cacheExchange, fetchExchange],
    });
  }, [saleorApiUrl, hasToken]);

  return <Provider value={client}>{children}</Provider>;
};
