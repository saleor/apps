import { NextPage } from "next";
import React, { useEffect } from "react";
import { ChannelsConfiguration } from "../modules/app-configuration/ui/channels-configuration";
import { trpcClient } from "../modules/trpc/trpc-client";
import { useRouter } from "next/router";
import { MainBar } from "../modules/ui/main-bar";
import { Button, makeStyles } from "@saleor/macaw-ui";
import { GitHub, OfflineBoltOutlined } from "@material-ui/icons";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Typography } from "@material-ui/core";

const useStyles = makeStyles({
  buttonsGrid: { display: "flex", gap: 10 },
  topBar: {
    marginBottom: 32,
  },
  appIconContainer: {
    background: `rgb(12, 197, 155)`,
    padding: 10,
    borderRadius: "50%",
    width: 50,
    height: 50,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
  },
});

const AppIcon = () => {
  const styles = useStyles();

  return (
    <div className={styles.appIconContainer}>
      <Typography variant="h2">PF</Typography>
    </div>
  );
};

const ConfigurationPage: NextPage = () => {
  const styles = useStyles();
  const channels = trpcClient.channels.fetch.useQuery();
  const router = useRouter();

  const { appBridge } = useAppBridge();

  const openInNewTab = (url: string) => {
    appBridge?.dispatch(
      actions.Redirect({
        to: url,
        newContext: true,
      })
    );
  };

  useEffect(() => {
    if (channels.isSuccess && channels.data.length === 0) {
      router.push("/not-ready");
    }
  }, [channels.data, channels.isSuccess]);

  return (
    <div>
      <MainBar
        icon={<AppIcon />}
        className={styles.topBar}
        name="Products Feed"
        author="By Saleor Commerce"
        rightColumnContent={
          <div className={styles.buttonsGrid}>
            <Button
              variant="secondary"
              startIcon={<GitHub />}
              onClick={() => {
                openInNewTab("https://github.com/saleor/apps");
              }}
            >
              Repository
            </Button>
            <Button
              startIcon={<OfflineBoltOutlined />}
              variant="secondary"
              onClick={() => {
                openInNewTab("https://github.com/saleor/apps/discussions");
              }}
            >
              Request a feature
            </Button>
          </div>
        }
      />
      <ChannelsConfiguration />
    </div>
  );
};

export default ConfigurationPage;
