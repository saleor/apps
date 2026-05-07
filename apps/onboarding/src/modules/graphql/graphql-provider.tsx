import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { createGraphQLClient } from "@saleor/apps-shared/create-graphql-client";
import { type PropsWithChildren, useMemo } from "react";
import { Provider } from "urql";

/**
 * Local GraphQL provider that uses the onboarding app's urql instance.
 *
 * pnpm resolves @saleor/apps-shared with graphql@16.11.0 (transitively from graphql-ws)
 * but onboarding pins graphql@16.7.1 (catalog). The two urql copies created from those
 * resolutions have separate React contexts, so apps-shared/graphql-provider's <Provider>
 * does not satisfy useQuery() called from this app. Wrapping with the local urql here
 * keeps Provider and useQuery on the same context.
 */
export function GraphQLProvider({ children }: PropsWithChildren) {
  const { appBridgeState } = useAppBridge();

  const client = useMemo(() => {
    if (!appBridgeState?.saleorApiUrl) return null;

    return createGraphQLClient({
      saleorApiUrl: appBridgeState.saleorApiUrl,
      token: appBridgeState.token,
    });
  }, [appBridgeState?.saleorApiUrl, appBridgeState?.token]);

  if (!client) return null;

  return <Provider value={client}>{children}</Provider>;
}
