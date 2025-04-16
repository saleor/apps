import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Layout } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";

import { AppHeader } from "@/modules/ui/app-header";

const ConfigPage: NextPage = () => {
  const { appBridgeState } = useAppBridge();

  if (!appBridgeState) {
    return null;
  }

  if (appBridgeState.user?.permissions.includes("MANAGE_APPS") === false) {
    return <Text>You do not have permission to access this page.</Text>;
  }

  return (
    <Box>
      <AppHeader />
      <Layout.AppSection
        marginBottom={14}
        heading="Stripe configurations"
        sideContent={
          <Box display="flex" flexDirection="column" gap={4}>
            <Text>App allows to create multiple configurations for Stripe</Text>
            <Text>
              You can set up multiple environments and assign them to each channel individually
            </Text>
          </Box>
        }
      >
        a
      </Layout.AppSection>
      <Layout.AppSection
        heading="Channels configurations"
        sideContent={
          <Box display="flex" flexDirection="column" gap={4}>
            <Text>Assign created Stripe configurations per channel</Text>
            <Text>You can configure multiple channels to use the same configuration</Text>
          </Box>
        }
      >
        b
      </Layout.AppSection>
    </Box>
  );
};

export default ConfigPage;
