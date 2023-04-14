import { trpcClient } from "../../trpc/trpc-client";
import { LinearProgress, Paper } from "@material-ui/core";
import React, { useEffect, useMemo, useState } from "react";
import { EditIcon, IconButton, makeStyles } from "@saleor/macaw-ui";
import { AppConfigContainer } from "../app-config-container";
import { UrlConfigurationForm } from "./url-configuration-form";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { AppColumnsLayout } from "../../ui/app-columns-layout";
import { FeedPreviewCard } from "./feed-preview-card";
import { Instructions } from "./instructions";
import { SideMenu } from "./side-menu";
import { useDashboardNotification } from "@saleor/apps-shared";

const useStyles = makeStyles((theme) => {
  return {
    grid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      alignItems: "start",
      gap: 40,
    },
    instructionsContainer: {
      padding: 15,
    },
    configurationColumn: {
      display: "flex",
      flexDirection: "column",
      gap: 20,
    },
  };
});

export const ChannelsConfiguration = () => {
  const styles = useStyles();

  const { appBridge } = useAppBridge();
  const { notifySuccess } = useDashboardNotification();

  const { data: configurationData, refetch: refetchConfig } =
    trpcClient.appConfiguration.fetch.useQuery();

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
    return <LinearProgress />;
  }

  if (!activeChannel) {
    return <div>Error. No channel available</div>;
  }

  return (
    <AppColumnsLayout>
      <SideMenu
        title="Channels"
        selectedItemId={activeChannel?.slug}
        headerToolbar={
          <IconButton
            variant="secondary"
            onClick={() => {
              appBridge?.dispatch(
                actions.Redirect({
                  to: `/channels/`,
                })
              );
            }}
          >
            <EditIcon />
          </IconButton>
        }
        onClick={(id) => setActiveChannelSlug(id)}
        items={channels.data.map((c) => ({ label: c.name, id: c.slug })) || []}
      />

      {activeChannel ? (
        <div className={styles.configurationColumn}>
          <Paper elevation={0}>
            <UrlConfigurationForm
              channelID={activeChannel.id}
              key={activeChannelSlug}
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
            {saveError && <span>{saveError.message}</span>}
          </Paper>
          <FeedPreviewCard channelSlug={activeChannel.slug} />
        </div>
      ) : null}
      <Instructions />
    </AppColumnsLayout>
  );
};
