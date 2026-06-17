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

  const saleorApiUrl = appBridgeState?.saleorApiUrl;
  const token = appBridgeState?.token;

  /*
   * Compute the client unconditionally so the hook order stays stable; it's null
   * until `saleorApiUrl` is available, and we render nothing until then.
   */
  const client = useMemo(
    () => (saleorApiUrl ? createGraphQLClient({ saleorApiUrl, token }) : null),
    [saleorApiUrl, token],
  );

  if (!client) {
    return null;
  }

  return <Provider value={client}>{children}</Provider>;
}
