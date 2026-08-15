import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import {
  AppPageHeader,
  DetailPageLayout,
  Savebar,
  SettingsFieldStack,
  SettingsPageContent,
  SettingsSection,
} from "@saleor/apps-ui-next";
import { Box, Text } from "@saleor/macaw-ui";
import { type NextPage } from "next";
import { useRouter } from "next/router";

import { trpcClient } from "@/modules/trpc/trpc-client";
import { NewStripeConfigForm } from "@/modules/ui/stripe-configs/new-stripe-config-form";
import { StripeModeLegend } from "@/modules/ui/stripe-setup/stripe-mode-legend";
import { useHasAppAccess } from "@/modules/ui/use-has-app-access";

const FORM_ID = "new_stripe_config_form";

const NewConfiguration: NextPage = () => {
  const { haveAccessToApp } = useHasAppAccess();
  const router = useRouter();
  const { notifyError, notifySuccess } = useDashboardNotification();

  /**
   * Saving creates a Stripe webhook, so a second submit would leave an orphaned
   * configuration behind — the savebar and inputs stay locked while it is in flight.
   */
  const { mutate: saveConfig, isLoading: isSaving } =
    trpcClient.appConfig.saveNewStripeConfig.useMutation({
      onSuccess() {
        notifySuccess("Configuration saved");

        return router.push("/config");
      },
      onError(err) {
        notifyError("Error saving config", err.message);
      },
    });

  if (!haveAccessToApp) {
    return (
      <Box padding={6}>
        <Text>You do not have permission to access this page.</Text>
      </Box>
    );
  }

  return (
    <DetailPageLayout withSavebar data-test-id="stripe-config-new-page">
      <AppPageHeader title="New Stripe configuration" href="/config" hrefTitle="Configuration" />
      <DetailPageLayout.Content>
        <SettingsPageContent
          description={
            <>
              Add a Stripe configuration. After saving, assign it to the Saleor channels that should
              use these keys on the configuration card.
            </>
          }
          aside={<StripeModeLegend />}
        >
          <SettingsSection
            title="Stripe keys"
            ownership="channel"
            description="Keys are used by every channel you assign to this configuration."
            data-test-id="stripe-new-config-card"
          >
            <SettingsFieldStack>
              <NewStripeConfigForm formId={FORM_ID} disabled={isSaving} onSubmit={saveConfig} />
            </SettingsFieldStack>
          </SettingsSection>
        </SettingsPageContent>
      </DetailPageLayout.Content>
      <Savebar>
        <Savebar.Spacer />
        <Savebar.CancelButton disabled={isSaving} onClick={() => router.push("/config")}>
          Cancel
        </Savebar.CancelButton>
        <Savebar.ConfirmButton form={FORM_ID} disabled={isSaving}>
          {isSaving ? "Saving…" : "Save"}
        </Savebar.ConfirmButton>
      </Savebar>
    </DetailPageLayout>
  );
};

export default NewConfiguration;
