import { Box, Button, Text } from "@saleor/macaw-ui";
import React from "react";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";

const NotReadyPage = () => {
  const { appBridge } = useAppBridge();

  return (
    <div>
      <h1>Saleor Product Feed App</h1>
      <Box>
        <Text>App can not be used</Text>
        <Text as={"p"}>To configure Product Feed App you need to create at least 1 channel</Text>
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
      </Box>
    </div>
  );
};

export default NotReadyPage;
