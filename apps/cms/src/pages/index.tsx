import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useIsMounted } from "usehooks-ts";
import { isInIframe } from "@saleor/apps-shared";

/**
 * This is page publicly accessible from your app.
 * You should probably remove it.
 */
const IndexPage: NextPage = () => {
  const { appBridgeState } = useAppBridge();
  const isMounted = useIsMounted();
  const { replace } = useRouter();

  useEffect(() => {
    if (isMounted() && appBridgeState?.ready) {
      replace("/home");
    }
  }, [isMounted, appBridgeState?.ready, replace]);

  if (isInIframe()) {
    return null;
  }

  return (
    <div>
      <h1>Saleor CMS Hub</h1>
      <p>This is Saleor App that allows to use external cms providers to sync products data.</p>
      <p>Install the app in your Saleor instance and open it in Dashboard.</p>
    </div>
  );
};

export default IndexPage;
