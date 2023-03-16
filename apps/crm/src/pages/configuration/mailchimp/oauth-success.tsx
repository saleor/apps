import { NextPage } from "next";
import React, { useEffect } from "react";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useRouter } from "next/router";
import { AppBridgeSession } from "../../../modules/app-bridge-session";

// TODO What about performing Oauth flow in iframe? AppBridge should stay in parent
const ConfigurationPage: NextPage = () => {
  // todo - this breaks, becasue iframe is refreshed. how to set it? in cookies?
  const { appBridgeState, appBridge } = useAppBridge();
  const router = useRouter();

  useEffect(() => {
    // todo - this fails, because mailchimp redirects to localhost, instead ngrok, so domain doesnt match
    const appBridge = new AppBridgeSession().constructAppBridgeFromSession();

    appBridge.dispatch(actions.NotifyReady());
    // todo somehow pass new appBridge instance to Provider, need to extend sdk?
  }, [appBridge]);

  console.log(appBridgeState);

  return (
    <div>
      <code>
        <pre>{JSON.stringify(appBridgeState, null, 2)}</pre>
      </code>
      config success, token: {router.query.token}
    </div>
  );
};

export default ConfigurationPage;
