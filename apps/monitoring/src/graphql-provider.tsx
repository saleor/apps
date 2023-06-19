import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { createGraphQLClient } from "@saleor/apps-shared";
import { PropsWithChildren } from "react";
import { Provider } from "urql";

export function GraphQLProvider(props: PropsWithChildren<{}>) {
  const { appBridgeState } = useAppBridge();
  const saleorApiUrl = appBridgeState?.saleorApiUrl!;
  const token = appBridgeState?.token!;

  const client = createGraphQLClient({
    saleorApiUrl,
    token,
  });

  return <Provider value={client} {...props} />;
}
