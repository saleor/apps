import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { PropsWithChildren } from "react";
import { Provider } from "urql";

import { createClient } from "../lib/graphql";

function GraphQLProvider(props: PropsWithChildren<{}>) {
  const { appBridgeState } = useAppBridge();
  const domain = appBridgeState?.domain!;

  const client = createClient(`https://${domain}/graphql/`, async () => ({
    token: appBridgeState?.token!,
  }));

  return <Provider value={client} {...props} />;
}

export default GraphQLProvider;
