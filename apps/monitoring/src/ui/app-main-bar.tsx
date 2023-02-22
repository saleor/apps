import { MainBar } from "./main-bar";
import { AppIcon } from "./app-icon";
import React from "react";
import { Button, makeStyles } from "@saleor/macaw-ui";
import { GitHub, OfflineBoltOutlined } from "@material-ui/icons";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";

const useStyles = makeStyles({
  buttonsGrid: { display: "flex", gap: 10 },
});

export const AppMainBar = () => {
  const styles = useStyles();

  const { appBridge } = useAppBridge();

  const openInNewTab = (url: string) => {
    appBridge?.dispatch(
      actions.Redirect({
        to: url,
        newContext: true,
      })
    );
  };

  return (
    <MainBar
      name="Monitoring"
      author="By Saleor Commerce"
      icon={<AppIcon />}
      bottomMargin
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
  );
};
