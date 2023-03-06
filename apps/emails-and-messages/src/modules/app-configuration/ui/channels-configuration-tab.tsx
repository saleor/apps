import React, { useEffect, useMemo, useState } from "react";
import { EditIcon, IconButton, makeStyles } from "@saleor/macaw-ui";
import { AppConfigContainer } from "../app-config-container";
import { AppConfigurationForm } from "./app-configuration-form";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { AppColumnsLayout } from "../../ui/app-columns-layout";
import { trpcClient } from "../../trpc/trpc-client";
import SideMenu from "./side-menu";
import { LoadingIndicator } from "../../ui/loading-indicator";

const useStyles = makeStyles((theme) => {
  return {
    formContainer: {
      top: 0,
    },
    instructionsContainer: {
      padding: 15,
    },
    configurationColumn: {
      display: "flex",
      flexDirection: "column",
      gap: 20,
      maxWidth: 600,
    },
  };
});

export const ChannelsConfigurationTab = () => {
  const styles = useStyles();
  const { appBridge } = useAppBridge();
  const [mjmlConfigurationsListData, setMjmlConfigurationsListData] = useState<
    { label: string; value: string }[]
  >([]);

  const [sendgridConfigurationsListData, setSendgridConfigurationsListData] = useState<
    { label: string; value: string }[]
  >([]);

  const { data: configurationData, refetch: refetchConfig } =
    trpcClient.appConfiguration.fetch.useQuery();

  trpcClient.mjmlConfiguration.getConfigurations.useQuery(
    {},
    {
      onSuccess(data) {
        setMjmlConfigurationsListData(
          data.map((configuration) => ({
            value: configuration.id,
            label: configuration.configurationName,
          }))
        );
      },
    }
  );

  trpcClient.sendgridConfiguration.fetch.useQuery(undefined, {
    onSuccess(data) {
      const keys = Object.keys(data.availableConfigurations);

      setSendgridConfigurationsListData(
        keys.map((key) => ({
          value: key,
          label: data.availableConfigurations[key].configurationName,
        }))
      );
    },
  });

  const {
    data: channels,
    isLoading: isChannelsLoading,
    isSuccess: isChannelsFetchSuccess,
  } = trpcClient.channels.fetch.useQuery();

  const { mutate, error: saveError } = trpcClient.appConfiguration.setAndReplace.useMutation({
    onSuccess() {
      refetchConfig();
      appBridge?.dispatch(
        actions.Notification({
          title: "Success",
          text: "Saved app configuration",
          status: "success",
        })
      );
    },
  });

  const [activeChannelSlug, setActiveChannelSlug] = useState<string | null>(null);

  useEffect(() => {
    if (isChannelsFetchSuccess) {
      setActiveChannelSlug(channels[0].slug ?? null);
    }
  }, [isChannelsFetchSuccess, channels]);

  const activeChannel = useMemo(() => {
    try {
      return channels!.find((c) => c.slug === activeChannelSlug)!;
    } catch (e) {
      return null;
    }
  }, [channels, activeChannelSlug]);

  if (isChannelsLoading) {
    return <LoadingIndicator />;
  }

  if (!channels?.length) {
    return <div>NO CHANNELS</div>;
  }

  if (!activeChannel) {
    return <div>Error. No channel available</div>;
  }

  return (
    <AppColumnsLayout>
      <SideMenu
        title="Channels"
        selectedItemId={activeChannel.slug}
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
        items={channels.map((c) => ({ label: c.name, id: c.slug })) || []}
      />
      {activeChannel ? (
        <div className={styles.configurationColumn}>
          <AppConfigurationForm
            channelID={activeChannel.id}
            key={activeChannelSlug}
            channelSlug={activeChannel.slug}
            mjmlConfigurationChoices={mjmlConfigurationsListData}
            sendgridConfigurationChoices={sendgridConfigurationsListData}
            onSubmit={async (data) => {
              const newConfig = AppConfigContainer.setChannelAppConfiguration(configurationData)(
                activeChannel.slug
              )(data);

              mutate(newConfig);
            }}
            initialData={AppConfigContainer.getChannelAppConfiguration(configurationData)(
              activeChannel.slug
            )}
            channelName={activeChannel?.name ?? activeChannelSlug}
          />
          {saveError && <span>{saveError.message}</span>}
        </div>
      ) : null}
    </AppColumnsLayout>
  );
};
