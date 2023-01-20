import { Typography } from "@material-ui/core";
import { AlertBase, Button } from "@saleor/macaw-ui";
import React from "react";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";

const alertStyle = {
  marginBottom: 40,
};

export const MainInfo = () => {
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
    <AlertBase style={alertStyle} variant="info">
      <Typography paragraph>Generate invoices for Orders in your shop</Typography>
      <Typography paragraph>
        Open any order and generate invoice. It will be uploaded and attached to the order. App will
        use Seller data from configuration below
      </Typography>
      <div style={{ display: "flex", gap: 20 }}>
        <Button
          onClick={() => {
            openInNewTab("https://github.com/saleor/saleor-app-invoices");
          }}
          variant="tertiary"
        >
          Repository
        </Button>
        <Button
          onClick={() => {
            openInNewTab("https://github.com/saleor/apps/discussions");
          }}
          variant="tertiary"
        >
          Request a feature
        </Button>
      </div>
    </AlertBase>
  );
};
