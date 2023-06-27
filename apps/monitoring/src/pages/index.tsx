import { NextPage } from "next";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useEffect } from "react";
import { isInIframe } from "@saleor/apps-shared";
import { useRouter } from "next/router";
import { Box, Text } from "@saleor/macaw-ui/next";

/**
 * This is page publicly accessible from your app.
 * You should probably remove it.
 */
const IndexPage: NextPage = () => {
  const { appBridgeState } = useAppBridge();
  const { replace } = useRouter();

  useEffect(() => {
    if (appBridgeState?.ready) {
      replace("/configuration");
    }
  }, [appBridgeState?.ready, replace]);

  if (isInIframe()) {
    return <Text>Loading...</Text>;
  }

  return (
    <Box>
      <Text variant="heading" as="h1">
        Saleor Monitoring
      </Text>
      <Text>Install App in Saleor Dashboard to use it</Text>
    </Box>
  );
};

export default IndexPage;
