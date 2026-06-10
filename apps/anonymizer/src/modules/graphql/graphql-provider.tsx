import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { createGraphQLClient } from "@saleor/apps-shared/create-graphql-client";
import { type PropsWithChildren, useMemo } from "react";
import { Provider } from "urql";

/**
 * Provides the urql client to the app.
 *
 * Unlike the shared provider, children are only rendered once `saleorApiUrl` is
 * available and a client exists. This prevents components that call urql hooks
 * (e.g. `useQuery`) at the top level from mounting before a client is set, which
 * would otherwise throw "No client has been specified using urql's Provider".
 */
export function GraphQLProvider({ children }: PropsWithChildren) {
  const { appBridgeState } = useAppBridge();

  if (!appBridgeState?.saleorApiUrl) {
    return null;
  }

  const client = useMemo(
    () =>
      createGraphQLClient({
        saleorApiUrl: appBridgeState.saleorApiUrl,
        token: appBridgeState.token,
      }),
    [appBridgeState.saleorApiUrl, appBridgeState.token],
  );

  return <Provider value={client}>{children}</Provider>;
}
