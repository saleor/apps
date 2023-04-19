import React, { useMemo, useState } from "react";
import { EditIcon, IconButton, makeStyles } from "@saleor/macaw-ui";
import { AppConfigurationForm } from "./app-configuration-form";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { AppColumnsLayout } from "../../ui/app-columns-layout";
import { trpcClient } from "../../trpc/trpc-client";
import { SideMenu } from "./side-menu";
import { LoadingIndicator } from "../../ui/loading-indicator";
import { Instructions } from "./instructions";
import { useDashboardNotification } from "@saleor/apps-shared";

const useStyles = makeStyles((theme) => {
  return {
    formContainer: {
      top: 0,
    },
    configurationColumn: {
      display: "flex",
      flexDirection: "column",
      gap: 20,
      maxWidth: 700,
    },
  };
});

export const ChannelsConfigurationTab = () => {
  const styles = useStyles();
  const { appBridge } = useAppBridge();
  const [activeChannelSlug, setActiveChannelSlug] = useState<string | null>(null);
  const { notifySuccess } = useDashboardNotification();

  const { data: channelsData, isLoading: isChannelsDataLoading } =
    trpcClient.channels.fetch.useQuery(undefined, {
      onSuccess: (data) => {
        if (data?.length) {
          setActiveChannelSlug(data[0].slug);
        }
      },
    });

  const {
    data: configurationData,
    refetch: refetchConfig,
    isLoading: isConfigurationDataLoading,
  } = trpcClient.appConfiguration.getChannelConfiguration.useQuery(
    {
      channelSlug: activeChannelSlug!,
    },
    { enabled: !!activeChannelSlug }
  );

  const { data: mjmlConfigurations, isLoading: isMjmlQueryLoading } =
    trpcClient.mjmlConfiguration.getConfigurations.useQuery({});

  const mjmlConfigurationsListData = useMemo(() => {
    return (
      mjmlConfigurations?.map((configuration) => ({
        value: configuration.id,
        label: configuration.configurationName,
      })) ?? []
    );
  }, [mjmlConfigurations]);

  const { data: sendgridConfigurations, isLoading: isSendgridQueryLoading } =
    trpcClient.sendgridConfiguration.getConfigurations.useQuery({});

  const sendgridConfigurationsListData = useMemo(() => {
    return (
      sendgridConfigurations?.map((configuration) => ({
        value: configuration.id,
        label: configuration.configurationName,
      })) ?? []
    );
  }, [sendgridConfigurations]);

  const { mutate: mutateAppChannelConfiguration, error: saveError } =
    trpcClient.appConfiguration.setChannelConfiguration.useMutation({
      onSuccess() {
        refetchConfig();

        notifySuccess("Success", "Saved app configuration");
      },
    });

  const activeChannel = channelsData?.find((c) => c.slug === activeChannelSlug);

  if (isChannelsDataLoading) {
    return <LoadingIndicator />;
  }
  if (!channelsData?.length) {
    return <div>NO CHANNELS</div>;
  }

  const isFormDataLoading =
    isConfigurationDataLoading || isMjmlQueryLoading || isSendgridQueryLoading;

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
        items={channelsData.map((c) => ({ label: c.name, id: c.slug })) || []}
      />
      <div className={styles.configurationColumn}>
        {!activeChannel || isFormDataLoading ? (
          <LoadingIndicator />
        ) : (
          <>
            <AppConfigurationForm
              channelID={activeChannel.id}
              key={activeChannelSlug}
              channelSlug={activeChannel.slug}
              mjmlConfigurationChoices={mjmlConfigurationsListData}
              sendgridConfigurationChoices={sendgridConfigurationsListData}
              onSubmit={async (data) => {
                mutateAppChannelConfiguration({
                  channel: activeChannel.slug,
                  configuration: data,
                });
              }}
              initialData={configurationData}
              channelName={activeChannel?.name ?? activeChannelSlug}
            />
            {saveError && <span>{saveError.message}</span>}
          </>
        )}
      </div>
      <Instructions />
    </AppColumnsLayout>
  );
};
