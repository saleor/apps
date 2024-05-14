import { NextPage } from "next";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useEffect } from "react";
import { useIsMounted } from "usehooks-ts";
import { useRouter } from "next/router";
import { isInIframe } from "@saleor/apps-shared";
import { appName } from "../const";
import { appUrls } from "../modules/app-configuration/urls";

const IndexPage: NextPage = () => {
  const { appBridgeState } = useAppBridge();
  const isMounted = useIsMounted();
  const { replace } = useRouter();

  useEffect(() => {
    if (isMounted() && appBridgeState?.ready) {
      replace(appUrls.configuration());
    }
  }, [isMounted, appBridgeState?.ready, replace]);

  if (isInIframe()) {
    return <p>Loading</p>;
  }

  return (
    <div>
      <h1>{appName}</h1>
      <p>This is Saleor App that allows sending emails from Saleor events via SMTP</p>
      <p>Install app in your Saleor instance and open in with Dashboard</p>
    </div>
  );
};

export default IndexPage;
