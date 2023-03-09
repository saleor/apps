import { AlertBase, Button } from "@saleor/macaw-ui";
import React from "react";
import { Typography } from "@material-ui/core";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { appName } from "./const";

const NotReadyPage = () => {
  const { appBridge } = useAppBridge();

  return (
    <div>
      <h1>{appName}</h1>
      <AlertBase variant="error">
        <Typography variant="h3" paragraph>
          App can not be used
        </Typography>
        <Typography paragraph>
          To configure the app you need to create at least 1 channel
        </Typography>
        <Button
          variant="primary"
          onClick={() => {
            appBridge?.dispatch(
              actions.Redirect({
                to: `/channels/add`,
              })
            );
          }}
        >
          Set up channel
        </Button>
      </AlertBase>
    </div>
  );
};

export default NotReadyPage;
