import { NextPage } from "next";
import React from "react";
import { AppConfigView } from "../modules/app-configuration/views/app-config.view";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Text } from "@saleor/macaw-ui";

const ConfigurationPage: NextPage = () => {
  const { appBridgeState } = useAppBridge();

  if (!appBridgeState) {
    return null;
  }

  if (appBridgeState.user?.permissions.includes("MANAGE_APPS") === false) {
    return <Text>You do not have permission to access this page.</Text>;
  }

  return <AppConfigView />;
};

export default ConfigurationPage;
