import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Text } from "@saleor/macaw-ui";

import { LogsRootSection } from "@/modules/client-logs/ui/logs-root-section";

import { ChannelSection } from "../modules/channel-configuration/ui/channel-section";
import { ProvidersSection } from "../modules/provider-connections/ui/providers-section";
import { AppPageLayout } from "../modules/ui/app-page-layout";
import { Section } from "../modules/ui/app-section";
import { MatcherSection } from "../modules/ui/matcher-section";

const Header = () => {
  return (
    <Section.Header>
      Configure the app by connecting to AvaTax. You can connect to multiple accounts.
    </Section.Header>
  );
};

const ConfigurationPage = () => {
  const { appBridgeState } = useAppBridge();

  if (!appBridgeState) {
    return null;
  }

  if (appBridgeState.user?.permissions.includes("MANAGE_APPS") === false) {
    return <Text>You do not have permission to access this page.</Text>;
  }

  return (
    <AppPageLayout
      top={<Header />}
      breadcrumbs={[
        {
          href: "/configuration",
          label: "Configuration",
        },
      ]}
    >
      <ProvidersSection />
      <ChannelSection />
      <MatcherSection />
      <LogsRootSection />
    </AppPageLayout>
  );
};

export default ConfigurationPage;
