import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { PropsWithChildren } from "react";
import { Provider } from "urql";
import { createClient } from "./lib/create-graphq-client";

export function GraphQLProvider(props: PropsWithChildren<{}>) {
  const { appBridgeState } = useAppBridge();

  const client = createClient(
    `/graphql`,
    async () => Promise.resolve({ token: appBridgeState?.token! }),
    () => appBridgeState?.saleorApiUrl!
  );

  return <Provider value={client} {...props} />;
}
