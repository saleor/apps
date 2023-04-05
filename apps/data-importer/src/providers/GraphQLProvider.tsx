import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { PropsWithChildren } from "react";
import { Provider } from "urql";

import { createClient } from "../lib/graphql";

export function GraphQLProvider(props: PropsWithChildren<{}>) {
  const { appBridgeState } = useAppBridge();

  const client = createClient(appBridgeState?.saleorApiUrl!, async () =>
    Promise.resolve({ token: appBridgeState?.token! })
  );

  return <Provider value={client} {...props} />;
}
