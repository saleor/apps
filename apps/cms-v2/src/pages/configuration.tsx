import { ProvidersList } from "@/modules/providers-listing/providers-list";
import { trpcClient } from "@/modules/trpc/trpc-client";
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
        heading="Providers configuration"
        sideContent={
          <Box>
            <Text>Configure one or more CMS providers to synchronize Saleor products.</Text>
          </Box>
        }
        mainContent={<ProvidersList />}
      />
    </Box>
  );
};

export default ConfigurationPage;
