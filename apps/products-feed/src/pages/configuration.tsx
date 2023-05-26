import { NextPage } from "next";
import React, { useEffect } from "react";
import { ChannelsConfiguration } from "../modules/app-configuration/ui/channels-configuration";
import { trpcClient } from "../modules/trpc/trpc-client";
import { useRouter } from "next/router";
import { ConfigurationPageBaseLayout } from "../modules/ui/configuration-page-base-layout";
import { useChannelsExistenceChecking } from "../modules/channels/use-channels-existence-checking";

const ConfigurationPage: NextPage = () => {
  useChannelsExistenceChecking();

  return (
    <ConfigurationPageBaseLayout>
      <ChannelsConfiguration />
    </ConfigurationPageBaseLayout>
  );
};

export default ConfigurationPage;
