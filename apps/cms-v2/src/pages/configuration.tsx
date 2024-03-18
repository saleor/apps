import { BulkSyncSection } from "@/modules/bulk-sync/bulk-sync-section";
import { ChannelProviderConnectionList } from "@/modules/channel-provider-connection/channels-provider-connection-list";
import { ProvidersList } from "@/modules/providers-listing/providers-list";
import { AppHeader } from "@/modules/ui/app-header";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Layout } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";

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
        heading="Providers configuration"
        sideContent={
          <Box>
            <Text>Configure one or more CMS providers to synchronize Saleor products.</Text>
          </Box>
        }
      >
        <ProvidersList />
      </Layout.AppSection>
      <Layout.AppSection
        marginBottom={14}
        heading="Automatic synchronization"
        sideContent={
          <Box>
            <Text>
              Map channels to providers to automatically sync every added, deleted or updated
              product variant.
            </Text>
          </Box>
        }
      >
        <ChannelProviderConnectionList />
      </Layout.AppSection>
      <Layout.AppSection
        heading="Initial sync"
        sideContent={
          <Box>
            <Text as="p" marginBottom={2}>
              Perform an initial scan of product variants to push existing database to selected
              provider.
            </Text>
            <Text as="p">Its recommended to run this flow initially, once app is configured.</Text>
          </Box>
        }
      >
        <BulkSyncSection />
      </Layout.AppSection>
    </Box>
  );
};

export default ConfigurationPage;
