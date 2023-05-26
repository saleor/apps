import { trpcClient } from "../../trpc/trpc-client";
import { Box, Button, Text } from "@saleor/macaw-ui/next";
import React, { useEffect, useMemo, useState } from "react";

import { AppConfigContainer } from "../app-config-container";
import { UrlConfigurationForm } from "./url-configuration-form";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";

import { FeedPreviewCard } from "./feed-preview-card";
import { Instructions } from "./instructions";
import { SideMenu } from "./side-menu";
import { useDashboardNotification } from "@saleor/apps-shared";
import { S3ConfigurationForm } from "./s3-configuration-form";

export const ChannelsConfiguration = () => {
  const { appBridge } = useAppBridge();
  const { notifySuccess } = useDashboardNotification();

  const { data: configurationData, refetch: refetchConfig } =
    trpcClient.appConfiguration.fetch.useQuery();

  console.log(configurationData);

  const channels = trpcClient.channels.fetch.useQuery();

  const [activeChannelSlug, setActiveChannelSlug] = useState<string | null>(null);

  const { mutate, error: saveError } = trpcClient.appConfiguration.setAndReplace.useMutation({
    onSuccess() {
      refetchConfig();
      notifySuccess("Success", "Saved app configuration");
    },
  });

  useEffect(() => {
    if (channels.isSuccess) {
      setActiveChannelSlug(channels.data![0]?.slug ?? null);
    }
  }, [channels.isSuccess, channels.data]);

  const activeChannel = useMemo(() => {
    try {
      return channels.data!.find((c) => c.slug === activeChannelSlug)!;
    } catch (e) {
      return null;
    }
  }, [channels.data, activeChannelSlug]);

  if (channels.isLoading || !channels.data) {
    return <Text>Loading...</Text>;
  }

  if (!activeChannel) {
    return <div>Error. No channel available</div>;
  }

  return (
    <Box>
      <SideMenu
        title="Channels"
        selectedItemId={activeChannel?.slug}
        headerToolbar={
          <Button
            variant="secondary"
            onClick={() => {
              appBridge?.dispatch(
                actions.Redirect({
                  to: `/channels/`,
                })
              );
            }}
          >
            edit
          </Button>
        }
        onClick={(id) => setActiveChannelSlug(id)}
        items={channels.data.map((c) => ({ label: c.name, id: c.slug })) || []}
      />

      {activeChannel ? (
        <div>
          <Box>
            <UrlConfigurationForm
              channelID={activeChannel.id}
              key={activeChannelSlug + "url"}
              channelSlug={activeChannel.slug}
              onSubmit={async (data) => {
                const newConfig = AppConfigContainer.setChannelUrlConfiguration(configurationData)(
                  activeChannel.slug
                )(data);

                mutate(newConfig);
              }}
              initialData={AppConfigContainer.getChannelUrlConfiguration(configurationData)(
                activeChannel.slug
              )}
              channelName={activeChannel?.name ?? activeChannelSlug}
            />
            <S3ConfigurationForm
              channelID={activeChannel.id}
              key={activeChannelSlug + "s3"}
              channelSlug={activeChannel.slug}
              onSubmit={async (data) => {
                const newConfig = AppConfigContainer.setChannelS3BucketConfiguration(
                  configurationData
                )(activeChannel.slug)(data);

                mutate(newConfig);
              }}
              initialData={AppConfigContainer.getChannelS3BucketConfiguration(configurationData)(
                activeChannel.slug
              )}
              channelName={activeChannel?.name ?? activeChannelSlug}
            />
            {saveError && <span>{saveError.message}</span>}
          </Box>
          <FeedPreviewCard channelSlug={activeChannel.slug} />
        </div>
      ) : null}
      <Instructions />
    </Box>
  );
};
