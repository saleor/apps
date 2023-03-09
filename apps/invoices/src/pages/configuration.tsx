import { NextPage } from "next";
import React, { useEffect } from "react";
import { ChannelsConfiguration } from "../modules/app-configuration/ui/channels-configuration";
import { trpcClient } from "../modules/trpc/trpc-client";
import { useRouter } from "next/router";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";

const ConfigurationPage: NextPage = () => {
  const channels = trpcClient.channels.fetch.useQuery();
  const router = useRouter();

  const { appBridge, appBridgeState } = useAppBridge();

  useEffect(() => {
    if (channels.isFetched && appBridge && !appBridgeState?.ready) {
      if (appBridge && channels.isFetched) {
        appBridge.dispatch(actions.NotifyReady());
      }
    }
  }, [channels.isFetched, appBridge, appBridgeState?.ready]);

  useEffect(() => {
    if (channels.isSuccess && channels.data.length === 0) {
      router.push("/not-ready");
    }
  }, [channels.data, channels.isSuccess]);

  return <ChannelsConfiguration />;
};

export default ConfigurationPage;
