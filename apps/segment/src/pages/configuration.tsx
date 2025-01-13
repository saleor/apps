import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Layout } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";

import { SegmentConfigForm } from "@/modules/configuration/segment-config-form/segment-config-form";
import { WebhookStatus } from "@/modules/configuration/webhooks-status/webhooks-status";
import { AppHeader } from "@/modules/ui/app-header";

const ConfigurationPage: NextPage = () => {
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
        heading="Segment.io configuration"
        sideContent={<Text>Provide Segment credentials to allow sending events.</Text>}
      >
        <SegmentConfigForm />
      </Layout.AppSection>
      <Layout.AppSection
        heading="Webhooks status"
        sideContent={<Text>Check status of registered webhooks.</Text>}
      >
        <WebhookStatus />
      </Layout.AppSection>
    </Box>
  );
};

export default ConfigurationPage;
