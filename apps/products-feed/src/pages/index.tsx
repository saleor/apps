import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { isInIframe } from "@saleor/apps-shared";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useIsMounted } from "usehooks-ts";

const IndexPage: NextPage = () => {
  const { appBridgeState } = useAppBridge();
  const isMounted = useIsMounted();
  const { replace } = useRouter();

  useEffect(() => {
    if (isMounted() && appBridgeState?.ready) {
      replace("/configuration");
    }
  }, [isMounted, appBridgeState?.ready]);

  if (isInIframe()) {
    return <span>Loading...</span>;
  }

  return (
    <div>
      <h1>Saleor Product Feed</h1>
      <p>This is Saleor App that allows product feed generation</p>
      <p>Install app in your Saleor instance and open in with Dashboard</p>
    </div>
  );
};

export default IndexPage;
