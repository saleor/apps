import { ParkedSetupChecklist } from "@saleor/apps-ui-next";
import { type NextPage } from "next";
import { useMemo } from "react";

import { trpcClient } from "@/modules/trpc/trpc-client";
import { MissingAppAccess } from "@/modules/ui/missing-app-access";
import {
  ChannelConfigSection,
  ChannelConfigSectionSkeleton,
} from "@/modules/ui/stripe-configs/channel-config-section";
import { ConfigPageShell } from "@/modules/ui/stripe-configs/config-page-shell";
import { StripeSetupCard } from "@/modules/ui/stripe-setup/stripe-setup-card";
import {
  buildStripeSetupTasks,
  summarizeStripeSetupTasks,
} from "@/modules/ui/stripe-setup/stripe-setup-summary";
import { useStripeSetupCardDismiss } from "@/modules/ui/stripe-setup/use-stripe-setup-card-dismiss";
import { useHasAppAccess } from "@/modules/ui/use-has-app-access";

const ConfigPage: NextPage = () => {
  const { haveAccessToApp, isReady } = useHasAppAccess();
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

  if (!isReady) {
    return (
      <ConfigPageShell>
        <ChannelConfigSectionSkeleton />
      </ConfigPageShell>
    );
  }

  if (!haveAccessToApp) {
    return <MissingAppAccess />;
  }

  const dataReady = configsQuery.data !== undefined && mappingQuery.data !== undefined;
  const showSetup = !dismissed && dataReady;
  const showParked = dismissed && dataReady && parkedSummary !== null;

  return (
    <ConfigPageShell>
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
    </ConfigPageShell>
  );
};

export default ConfigPage;
