import { trpcClient } from "../../trpc/trpc-client";
import { Link, Paper, Typography } from "@material-ui/core";
import React, { useEffect, useMemo, useState } from "react";
import { makeStyles } from "@saleor/macaw-ui";
import { AppConfigContainer } from "../app-config-container";
import { AddressForm } from "./address-form";
import { ChannelsList } from "./channels-list";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { AppColumnsLayout } from "../../ui/app-columns-layout";
import { useDashboardNotification } from "@saleor/apps-shared";

const useStyles = makeStyles((theme) => {
  return {
    header: { marginBottom: 20 },
    grid: { display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "start", gap: 40 },
    formContainer: {},
    instructionsContainer: {
      marginTop: 12,
      padding: 15,
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
    return null;
  }

  if (!activeChannel) {
    return <div>Error. No channel available</div>;
  }

  return (
    <AppColumnsLayout>
      <ChannelsList
        channels={channels.data}
        activeChannelSlug={activeChannel.slug}
        onChannelClick={(slug) => {
          setActiveChannelSlug(slug);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {activeChannel ? (
        <Paper elevation={0} className={styles.formContainer}>
          <AddressForm
            channelID={activeChannel.id}
            key={activeChannelSlug}
            channelSlug={activeChannel.slug}
            onSubmit={async (data) => {
              const newConfig = AppConfigContainer.setChannelAddress(configurationData)(
                activeChannel.slug
              )(data);

              mutate(newConfig);
            }}
            initialData={AppConfigContainer.getChannelAddress(configurationData)(
              activeChannel.slug
            )}
            channelName={activeChannel?.name ?? activeChannelSlug}
          />
          {saveError && <span>{saveError.message}</span>}
        </Paper>
      ) : null}
      <Paper elevation={0} className={styles.instructionsContainer}>
        <Typography paragraph variant="h4">
          Generate invoices for orders in your shop
        </Typography>
        <Typography paragraph>
          Shop data on the invoice an be configured per channel. If not set it will use shop data
          from{" "}
          <Link
            onClick={() => {
              appBridge?.dispatch(
                actions.Redirect({
                  to: "/site-settings",
                })
              );
            }}
          >
            the configuration
          </Link>
        </Typography>
        <Typography>
          Go to{" "}
          <Link
            onClick={() => {
              appBridge?.dispatch(
                actions.Redirect({
                  to: "/orders",
                })
              );
            }}
          >
            Orders
          </Link>{" "}
          and open any Order. Then click <strong>Invoices -{">"} Generate</strong>. Invoice will be
          added to the order page
        </Typography>
      </Paper>
    </AppColumnsLayout>
  );
};
