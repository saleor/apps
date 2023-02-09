import { NextPage } from "next";
import React, { useEffect } from "react";
import { ChannelsConfiguration } from "../modules/app-configuration/ui/channels-configuration";
import { trpcClient } from "../modules/trpc/trpc-client";
import { useRouter } from "next/router";
import { Button, makeStyles } from "@saleor/macaw-ui";
import { GitHub, OfflineBoltOutlined } from "@material-ui/icons";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import appIcon from "../app-invoices-icon.svg";
import Image from "next/image";
import { AppIcon, MainBar } from "@saleor/apps-shared";

const useStyles = makeStyles({
  buttonsGrid: { display: "flex", gap: 10 },
  topBar: {
    marginBottom: 32,
  },
});

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
        icon={
          <AppIcon
            theme={`rgb(227, 149, 60)`}
            icon={<Image width={30} height={30} alt="icon" src={appIcon} />}
          />
        }
        className={styles.topBar}
        name="Saleor Invoices"
        author="By Saleor Commerce"
        rightColumnContent={
          <div className={styles.buttonsGrid}>
            <Button
              variant="secondary"
              startIcon={<GitHub />}
              onClick={() => {
                openInNewTab("https://github.com/saleor/saleor-app-invoices");
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
