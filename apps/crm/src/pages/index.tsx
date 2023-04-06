import { NextPage } from "next";
import React, { useEffect } from "react";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";

import { useRouter } from "next/router";

const IndexPage: NextPage = () => {
  const { appBridgeState, appBridge } = useAppBridge();
  const { replace } = useRouter();

  useEffect(() => {
    if (appBridgeState?.ready) {
      replace("/configuration/providers/mailchimp");
    }
  }, [appBridgeState, appBridge]);

  return <p>Loading</p>;
};

export default IndexPage;
