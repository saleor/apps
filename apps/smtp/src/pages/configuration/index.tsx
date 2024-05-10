import { Box, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";
import { SectionWithDescription } from "../../components/section-with-description";
import {
  ConfigurationListItem,
  MessagingProvidersBox,
} from "../../modules/app-configuration/ui/messaging-providers-box";
import { trpcClient } from "../../modules/trpc/trpc-client";
import { appUrls } from "../../modules/app-configuration/urls";
import { BasicLayout } from "../../components/basic-layout";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";

const ConfigurationPage: NextPage = () => {
  const { appBridgeState } = useAppBridge();

  const { data: dataSmtp, isLoading: isLoadingSmtp } =
    trpcClient.smtpConfiguration.getConfigurations.useQuery();

  const data: ConfigurationListItem[] = [
    ...(dataSmtp?.map((configuration) => ({
      name: configuration.name,
      provider: "smtp" as const,
      id: configuration.id,
      active: configuration.active,
    })) || []),
  ];

  const isLoading = isLoadingSmtp;

  if (!appBridgeState) {
    return null;
  }

  if (appBridgeState.user?.permissions.includes("MANAGE_APPS") === false) {
    return <Text>You do not have permission to access this page.</Text>;
  }

  return (
    <BasicLayout breadcrumbs={[{ name: "Configuration", href: appUrls.configuration() }]}>
      <Box display="grid" gridTemplateColumns={{ desktop: 3, mobile: 1 }}>
        <Box>
          <Text>Configure SMTP app to deliver Saleor Event webhooks to SMTP servers.</Text>
        </Box>
      </Box>
      <SectionWithDescription
        title="Configurations"
        description={<Text>Manage configurations and modify it&apos;s message templates.</Text>}
      >
        <MessagingProvidersBox configurations={data || []} isLoading={isLoading} />
      </SectionWithDescription>
    </BasicLayout>
  );
};

export default ConfigurationPage;
