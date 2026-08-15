import { TextLink } from "@saleor/apps-ui";
import {
  AppPageHeader,
  DetailPageLayout,
  ParkedSetupChecklist,
  SettingsPageContent,
} from "@saleor/apps-ui-next";
import { Box, Text } from "@saleor/macaw-ui";
import { type NextPage } from "next";
import { useMemo } from "react";

import { trpcClient } from "@/modules/trpc/trpc-client";
import { ChannelConfigSection } from "@/modules/ui/stripe-configs/channel-config-section";
import { StripeModeLegend } from "@/modules/ui/stripe-setup/stripe-mode-legend";
import { StripeSetupCard } from "@/modules/ui/stripe-setup/stripe-setup-card";
import {
  buildStripeSetupTasks,
  summarizeStripeSetupTasks,
} from "@/modules/ui/stripe-setup/stripe-setup-summary";
import { useStripeSetupCardDismiss } from "@/modules/ui/stripe-setup/use-stripe-setup-card-dismiss";
import { useHasAppAccess } from "@/modules/ui/use-has-app-access";

const ConfigPage: NextPage = () => {
  const { haveAccessToApp } = useHasAppAccess();
  const { dismissed, dismiss, restore } = useStripeSetupCardDismiss();
  const configsQuery = trpcClient.appConfig.getStripeConfigsList.useQuery();
  const mappingQuery = trpcClient.appConfig.channelsConfigsMapping.useQuery();

  const parkedSummary = useMemo(() => {
    if (!configsQuery.data || !mappingQuery.data) {
      return null;
    }

    return summarizeStripeSetupTasks(
      buildStripeSetupTasks({
        configs: configsQuery.data,
        mapping: mappingQuery.data,
      }),
    );
  }, [configsQuery.data, mappingQuery.data]);

  if (!haveAccessToApp) {
    return (
      <Box padding={6}>
        <Text>You do not have permission to access this page.</Text>
      </Box>
    );
  }

  const dataReady = configsQuery.data !== undefined && mappingQuery.data !== undefined;
  const showSetup = !dismissed && dataReady;
  const showParked = dismissed && dataReady && parkedSummary !== null;

  return (
    <DetailPageLayout data-test-id="stripe-config-page">
      <AppPageHeader
        title="Configuration"
        actions={
          <TextLink href="https://docs.saleor.io/developer/app-store/apps/stripe/overview" newTab>
            Documentation
          </TextLink>
        }
      />
      <DetailPageLayout.Content>
        <SettingsPageContent
          description={
            <>
              Create Stripe configurations, then assign which Saleor channels use each one. Checkout
              uses the configuration mapped to that channel.
            </>
          }
          aside={<StripeModeLegend />}
        >
          {showSetup ? (
            <StripeSetupCard
              configs={configsQuery.data}
              mapping={mappingQuery.data}
              onDismiss={dismiss}
            />
          ) : null}
          {showParked && parkedSummary ? (
            <ParkedSetupChecklist
              title="Finish Stripe setup"
              progress={parkedSummary.progress}
              nextUp={parkedSummary.nextUp}
              onReveal={restore}
              data-test-id="stripe-parked-setup-checklist"
            />
          ) : null}
          <ChannelConfigSection />
        </SettingsPageContent>
      </DetailPageLayout.Content>
    </DetailPageLayout>
  );
};

export default ConfigPage;
