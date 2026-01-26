import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Box, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";

import { BasicLayout } from "../../components/basic-layout";
import { SectionWithDescription } from "../../components/section-with-description";
import { ConfigurationFallback } from "../../modules/app-configuration/ui/configuration-fallback";
import {
  ConfigurationListItem,
  MessagingProvidersBox,
} from "../../modules/app-configuration/ui/messaging-providers-box";
import { appUrls } from "../../modules/app-configuration/urls";
import { trpcClient } from "../../modules/trpc/trpc-client";

const ConfigurationPage: NextPage = () => {
  const { appBridgeState, appBridge } = useAppBridge();

  const { data: fallbackConfigData } =
    trpcClient.smtpConfiguration.isFallbackSmtpConfigured.useQuery();

  const saleorCloudFallbackAvailable = fallbackConfigData?.isConfigured ?? false;

  const { data: dataSmtp, isLoading: isLoadingSmtp } =
    trpcClient.smtpConfiguration.getConfigurations.useQuery();

  const fallbackSettingsQuery = trpcClient.smtpConfiguration.getFallbackSmtpSettings.useQuery();
  const fallbackSettingsMutation =
    trpcClient.smtpConfiguration.updateFallbackSmtpSettings.useMutation({
      onSuccess: () => {
        appBridge?.dispatch(
          actions.Notification({
            title: "Success",
            status: "success",
          }),
        );
      },
      onError: (e) => {
        appBridge?.dispatch(
          actions.Notification({
            title: "Error",
            status: "error",
            text: e.message,
          }),
        );
      },
      onSettled: () => {
        fallbackSettingsQuery.refetch();
      },
    });

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
        <MessagingProvidersBox
          configurations={data || []}
          isLoading={isLoading}
          saleorCloudFallbackAvailable={saleorCloudFallbackAvailable}
        />
      </SectionWithDescription>
      {saleorCloudFallbackAvailable && (
        <SectionWithDescription
          title="Fallback behavior"
          description={
            <Text>
              Configure how should app behave for events not covered by custom SMTP configuration
            </Text>
          }
        >
          <ConfigurationFallback
            onChange={(newValue) => {
              fallbackSettingsMutation.mutate({ useSaleorSmtpFallback: newValue });
            }}
            useSaleorSmtpFallback={fallbackSettingsQuery.data?.useSaleorSmtpFallback}
            loading={fallbackSettingsQuery.isLoading}
            saving={fallbackSettingsMutation.isLoading ?? fallbackSettingsQuery.isRefetching}
          />
        </SectionWithDescription>
      )}
    </BasicLayout>
  );
};

export default ConfigurationPage;
