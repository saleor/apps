import { NextPage } from "next";
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { trpcClient } from "../../../modules/trpc/trpc-client";
import { ConfigurationPageBaseLayout } from "../../../modules/ui/configuration-page-base-layout";
import { ChannelsConfigurationTab } from "../../../modules/app-configuration/ui/channels-configuration-tab";

const ChannelsConfigurationPage: NextPage = () => {
  const channels = trpcClient.channels.fetch.useQuery();
  const router = useRouter();

  useEffect(() => {
    if (router && channels.isSuccess && channels.data.length === 0) {
      router.push("/not-ready");
    }
  }, [channels.data, channels.isSuccess, router]);
  return (
    <ConfigurationPageBaseLayout>
      <ChannelsConfigurationTab />
    </ConfigurationPageBaseLayout>
  );
};

export default ChannelsConfigurationPage;
