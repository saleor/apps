import { NextPage } from "next";
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { trpcClient } from "../../../modules/trpc/trpc-client";
import { ConfigurationPageBaseLayout } from "../../../modules/ui/configuration-page-base-layout";

const ChannelsConfigurationPage: NextPage = () => {
  const channels = trpcClient.channels.fetch.useQuery();
  const router = useRouter();

  const sendgridConfigurations = trpcClient.sendgridConfiguration.getConfigurations.useQuery();
  const mjmlConfigurations = trpcClient.mjmlConfiguration.getConfigurations.useQuery();

  useEffect(() => {
    if (router && channels.isSuccess && channels.data.length === 0) {
      router.push("/not-ready");
    }
  }, [channels.data, channels.isSuccess, router]);
  return (
    <ConfigurationPageBaseLayout>
      Sendgrid configurations:
      <ul>
        {sendgridConfigurations.data?.map((c) => (
          <li key={c.id}>{c.configurationName}</li>
        ))}
      </ul>
      MJML configurations:
      <ul>
        {mjmlConfigurations.data?.map((c) => (
          <li key={c.id}>{c.configurationName}</li>
        ))}
      </ul>
    </ConfigurationPageBaseLayout>
  );
};

export default ChannelsConfigurationPage;
