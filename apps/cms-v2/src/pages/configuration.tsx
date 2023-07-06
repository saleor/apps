import { ChannelProviderConnectionList } from "@/modules/channel-provider-connection/channels-provier-connection-list";
import { ProvidersList } from "@/modules/providers-listing/providers-list";
import { AppSection } from "@/modules/ui/app-section";
import { Breadcrumbs } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";

// todo extract / abstract breadcrumbs
const ConfigurationPage: NextPage = () => {
  return (
    <Box>
      <Box marginBottom={14}>
        <Breadcrumbs>
          <Breadcrumbs.Item>Saleor App CMS</Breadcrumbs.Item>
          <Breadcrumbs.Item>Configuration</Breadcrumbs.Item>
        </Breadcrumbs>
        <Text as="p" marginTop={4}>
          Connect Saleor Products to your favorite CMS platforms
        </Text>
      </Box>
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
            <Text>
              Perform initial scan of product variants to push existing database yo selected
              provider.
            </Text>
          </Box>
        }
        mainContent={<Text>TODO</Text>}
      />
    </Box>
  );
};

export default ConfigurationPage;
