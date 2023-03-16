import { NextPage } from "next";
import React, { useEffect } from "react";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { LoginWithMailchimpButton } from "../modules/ui/login-with-mailchimp-button/login-with-mailchimp-button";

const IndexPage: NextPage = () => {
  const { appBridgeState } = useAppBridge();

  useEffect(() => {
    console.log(appBridgeState);
  }, [appBridgeState]);

  if (!appBridgeState?.ready) {
    return <p>loading</p>;
  }

  return (
    <div>
      <a href={`/api/auth/mailchimp`}>
        <LoginWithMailchimpButton />
      </a>
    </div>
  );
};

export default IndexPage;
