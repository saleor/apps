import { NextPage } from "next";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useEffect } from "react";
import { useIsMounted } from "usehooks-ts";
import { useRouter } from "next/router";
import { isInIframe } from "@saleor/apps-shared";

const IndexPage: NextPage = () => {
  const { appBridgeState } = useAppBridge();
  const isMounted = useIsMounted();
  const { replace } = useRouter();

  useEffect(() => {
    if (isMounted() && appBridgeState?.ready) {
      replace("/configuration");
    }
  }, [isMounted, appBridgeState?.ready, replace]);

  if (isInIframe()) {
    return <p>Loading</p>;
  }

  return (
    <div>
      <h1>Saleor App - Twilio Segment integration</h1>
      <p>This is Saleor App that synchronized order events to Segment</p>
      <p>Install app in your Saleor instance and open in with Dashboard</p>
    </div>
  );
};

export default IndexPage;
