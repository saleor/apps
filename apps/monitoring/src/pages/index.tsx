import { NextPage } from "next";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { MouseEventHandler, useEffect, useState } from "react";
import { isInIframe } from "@saleor/apps-shared";
import { useRouter } from "next/router";
import { Text } from "@saleor/macaw-ui/next";

/**
 * This is page publicly accessible from your app.
 * You should probably remove it.
 */
const IndexPage: NextPage = () => {
  const { appBridgeState, appBridge } = useAppBridge();
  const { replace } = useRouter();

  useEffect(() => {
    if (appBridgeState?.ready) {
      replace("/configuration");
    }
  }, [appBridgeState?.ready, replace]);

  if (isInIframe()) {
    return <Text>Loading</Text>;
  }

  return (
    <div>
      <h1>Saleor Monitoring</h1>
      <p>Install App in Saleor to use it</p>
    </div>
  );
};

export default IndexPage;
