import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { PropsWithChildren } from "react";
import { Provider } from "urql";
import { createClient } from "./create-graphq-client";

export function GraphQLProvider(props: PropsWithChildren<{}>) {
  const { appBridgeState } = useAppBridge();
  const saleorApiUrl = appBridgeState?.saleorApiUrl!;

  if (!appBridgeState?.saleorApiUrl) {
    return <div {...props}></div>;
  }

  const client = createClient(saleorApiUrl, async () =>
    Promise.resolve({ token: appBridgeState?.token! })
  );

  return <Provider value={client} {...props} />;
}
