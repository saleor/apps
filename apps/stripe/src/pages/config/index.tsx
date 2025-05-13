import { Layout } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";

import { AppHeader } from "@/modules/ui/app-header";
import { ChannelConfigMappingSection } from "@/modules/ui/channel-configs/channel-config-mapping-section";
import { ChannelConfigSection } from "@/modules/ui/stripe-configs/channel-config-section";
import { useHasAppAccess } from "@/modules/ui/use-has-app-access";

const ConfigPage: NextPage = () => {
  const { haveAccessToApp } = useHasAppAccess();

  if (!haveAccessToApp) {
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
        <ChannelConfigSection />
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
        <ChannelConfigMappingSection />
      </Layout.AppSection>
    </Box>
  );
};

export default ConfigPage;
