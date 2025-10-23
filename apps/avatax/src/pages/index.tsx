import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { isInIframe } from "@saleor/apps-shared/is-in-iframe";
import { Box, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useIsMounted } from "usehooks-ts";

const IndexPage: NextPage = () => {
  const { appBridgeState } = useAppBridge();
  const isMounted = useIsMounted();
  const { replace } = useRouter();

  useEffect(() => {
    if (isMounted() && appBridgeState?.ready) {
      replace("/configuration");
    }
  }, [isMounted, appBridgeState?.ready, replace]);

  if (isInIframe()) {
    return <span>Loading...</span>;
  }

  return (
    <Box display="flex" flexDirection="column" padding={4}>
      <Text as="h1" fontWeight="bold" fontSize={8} marginBottom={6}>
        Saleor AvaTax App
      </Text>
      <Text>This is Saleor App that allows to use external service to handle taxes.</Text>
      <Text>Install the app in your Saleor instance and open it in Dashboard.</Text>
    </Box>
  );
};

export default IndexPage;
