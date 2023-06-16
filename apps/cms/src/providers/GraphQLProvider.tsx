import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { createGraphQLClient } from "@saleor/apps-shared";
import { PropsWithChildren } from "react";
import { Provider } from "urql";

export function GraphQLProvider(props: PropsWithChildren<{}>) {
  const { appBridgeState } = useAppBridge();
  const saleorApiUrl = appBridgeState?.saleorApiUrl!;
  const token = appBridgeState?.token!;

<<<<<<< HEAD
  const client = createGraphQLClient({
    saleorApiUrl,
    token,
  });
=======
  if (!saleorApiUrl) {
    return <>{props.children}</>;
  }

  const client = createClient(saleorApiUrl, async () => ({
    token: appBridgeState?.token!,
  }));
>>>>>>> ab0d55dd (Update Sentry in CMS)

  return <Provider value={client} {...props} />;
}
