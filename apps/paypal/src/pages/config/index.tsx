import { Layout } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";

import { AppHeader } from "@/modules/ui/app-header";
import { ChannelConfigMappingSection } from "@/modules/ui/channel-configs/channel-config-mapping-section";
import { ChannelConfigSection } from "@/modules/ui/paypal-configs/channel-config-section";
import { MerchantConnectionSection } from "@/modules/ui/merchant-connection/merchant-connection-section";
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
        marginBottom={10}
        heading="🔗 PayPal Account Connection"
        sideContent={
          <Box display="flex" flexDirection="column" gap={3}>
            <Text size={3}>
              Connect your PayPal merchant account to enable payment processing. This integration uses secure Partner credentials managed by WSM.
            </Text>
            <Text size={3} color="default2">
              Once connected, customers can pay using PayPal, credit/debit cards, Apple Pay, Google Pay, and other payment methods.
            </Text>
          </Box>
        }
      >
        <MerchantConnectionSection />
      </Layout.AppSection>
      <Layout.AppSection
        marginBottom={10}
        heading="⚙️ PayPal Configurations"
        sideContent={
          <Box display="flex" flexDirection="column" gap={3}>
            <Text size={3}>
              View PayPal configurations for different environments (test and live mode). Configurations are managed by WSM administrators.
            </Text>
            <Text size={3} color="default2">
              Each configuration can be assigned to specific sales channels to support multi-channel operations.
            </Text>
          </Box>
        }
      >
        <ChannelConfigSection />
      </Layout.AppSection>
      <Layout.AppSection
        marginBottom={8}
        heading="🏪 Channel Assignments"
        sideContent={
          <Box display="flex" flexDirection="column" gap={3}>
            <Text size={3}>
              Map your PayPal configurations to specific Saleor sales channels.
            </Text>
            <Text size={3} color="default2">
              Multiple channels can share the same configuration, making it easy to manage payments across your store.
            </Text>
          </Box>
        }
      >
        <ChannelConfigMappingSection />
      </Layout.AppSection>
    </Box>
  );
};

export default ConfigPage;
