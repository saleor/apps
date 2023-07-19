import { BulkSyncSection } from "@/modules/bulk-sync/bulk-sync-section";
import { ChannelProviderConnectionList } from "@/modules/channel-provider-connection/channels-provider-connection-list";
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
              Map channels to providers to automatically sync every added, deleted or updated
              product variant.
            </Text>
          </Box>
        }
        mainContent={<ChannelProviderConnectionList />}
      />
      <AppSection
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
        mainContent={<BulkSyncSection />}
      />
    </Box>
  );
};

export default ConfigurationPage;
