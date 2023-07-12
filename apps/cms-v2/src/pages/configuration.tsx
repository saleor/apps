import { BulkSyncSection } from "@/modules/bulk-sync/bulk-sync-section";
import { ChannelProviderConnectionList } from "@/modules/channel-provider-connection/channels-provier-connection-list";
import { ProvidersList } from "@/modules/providers-listing/providers-list";
import { AppHeader } from "@/modules/ui/app-header";
import { AppSection } from "@/modules/ui/app-section";
import { Box, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";

const ConfigurationPage: NextPage = () => {
  return (
    <Box>
      <AppHeader />
      <AppSection
        marginBottom={14}
        heading="Providers configuration"
        sideContent={
          <Box>
            <Text>Configure one or more CMS providers to synchronize Saleor products.</Text>
          </Box>
        }
        mainContent={<ProvidersList />}
      />
      <AppSection
        marginBottom={14}
        heading="Automatic synchronization"
        sideContent={
          <Box>
            <Text>
              Map channels to providers to automatically sync every added, deleted or update product
              variant.
            </Text>
          </Box>
        }
        mainContent={<ChannelProviderConnectionList />}
      />
      <AppSection
        heading="Initial sync"
        sideContent={
          <Box>
            <Text as="p">
              Perform initial scan of product variants to push existing database yo selected
              provider.
            </Text>
            <Text as="p">Its recommended to run this flow initially, once app is configured.</Text>
            <Text as="p" color="iconCriticalDefault">
              Warning - removed products will not be removed in CMS. To create a fully updated
              state, first prune CMS content.
            </Text>
          </Box>
        }
        mainContent={<BulkSyncSection />}
      />
    </Box>
  );
};

export default ConfigurationPage;
