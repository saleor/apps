import { NextPage } from "next";
import React, { useEffect } from "react";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useRouter } from "next/router";

const ConfigurationPage: NextPage = () => {
  // todo - this breaks, becasue iframe is refreshed. how to set it? in cookies?
  const { appBridgeState, appBridge } = useAppBridge();
  const router = useRouter();

  useEffect(() => {
    appBridge?.dispatch(actions.NotifyReady());
  }, [appBridge]);

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
