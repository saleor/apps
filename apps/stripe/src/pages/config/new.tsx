import { zodResolver } from "@hookform/resolvers/zod";
import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { useUnsavedChangesGuard } from "@saleor/apps-shared/use-unsaved-changes-guard";
import {
  AppPageHeader,
  DetailPageLayout,
  ExitFormDialog,
  Savebar,
  SettingsFieldStack,
  SettingsPageContent,
  SettingsSection,
} from "@saleor/apps-ui-next";
import { Box, Text } from "@saleor/macaw-ui";
import { type NextPage } from "next";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { newStripeConfigInputSchema } from "@/modules/app-config/trpc-handlers/new-stripe-config-input-schema";
import { trpcClient } from "@/modules/trpc/trpc-client";
import { inferStripeEnvFromKeys } from "@/modules/ui/stripe-configs/infer-stripe-env-from-keys";
import {
  StripeConfigFields,
  type StripeConfigFormShape,
} from "@/modules/ui/stripe-configs/stripe-config-fields";
import { StripeEnvBadge } from "@/modules/ui/stripe-configs/stripe-env-badge";
import { StripeModeLegend } from "@/modules/ui/stripe-setup/stripe-mode-legend";
import { useHasAppAccess } from "@/modules/ui/use-has-app-access";

const FORM_ID = "new_stripe_config_form";
const CONFIG_LIST_PATH = "/config";

const NewConfiguration: NextPage = () => {
  const { haveAccessToApp } = useHasAppAccess();
  const { notifyError, notifySuccess } = useDashboardNotification();

  const {
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<StripeConfigFormShape>({
    defaultValues: {
      name: "",
      publishableKey: "",
      restrictedKey: "",
    },
    resolver: zodResolver(newStripeConfigInputSchema),
  });

  const publishableKey = useWatch({ control, name: "publishableKey" });
  const restrictedKey = useWatch({ control, name: "restrictedKey" });
  const envHint = inferStripeEnvFromKeys({ publishableKey, restrictedKey });

  /**
   * Submitting is not enough to drop the guard: react-hook-form reports a successful submit as
   * soon as the mutation is fired, while the keys are only safe once the server accepted them.
   */
  const [isSaved, setIsSaved] = useState(false);

  const guard = useUnsavedChangesGuard({ enabled: isDirty && !isSaved });

  /**
   * Saving creates a Stripe webhook, so a second submit would leave an orphaned
   * configuration behind — the savebar and inputs stay locked while it is in flight.
   */
  const {
    mutate: saveConfig,
    isLoading: isSaving,
    isError: isSaveError,
  } = trpcClient.appConfig.saveNewStripeConfig.useMutation({
    onSuccess() {
      notifySuccess("Configuration saved");
      setIsSaved(true);

      guard.navigateWithoutGuard(CONFIG_LIST_PATH);
    },
    onError(error) {
      notifyError("Error saving config", error.message);
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
      <AppPageHeader
        title="New Stripe configuration"
        href={CONFIG_LIST_PATH}
        hrefTitle="Configuration"
      />
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
          <Box as="form" id={FORM_ID} onSubmit={handleSubmit((values) => saveConfig(values))}>
            <SettingsSection
              title="Stripe keys"
              ownership="channel"
              description="Keys are used by every channel you assign to this configuration."
              headerEnd={envHint ? <StripeEnvBadge env={envHint} /> : undefined}
              data-test-id="stripe-new-config-card"
            >
              <SettingsFieldStack>
                <StripeConfigFields control={control} errors={errors} disabled={isSaving} />
              </SettingsFieldStack>
            </SettingsSection>
          </Box>
        </SettingsPageContent>
      </DetailPageLayout.Content>
      <Savebar>
        <Savebar.Spacer />
        <Savebar.CancelButton
          disabled={isSaving}
          onClick={() => guard.navigateWithoutGuard(CONFIG_LIST_PATH)}
        >
          Cancel
        </Savebar.CancelButton>
        <Savebar.ConfirmButton
          form={FORM_ID}
          disabled={!isDirty || isSaving}
          transitionState={isSaving ? "loading" : isSaveError ? "error" : "default"}
        >
          Save
        </Savebar.ConfirmButton>
      </Savebar>
      <ExitFormDialog
        isOpen={guard.isBlocked}
        onClose={guard.keepEditing}
        onLeave={guard.leave}
        description="The configuration has not been saved yet. Leaving now discards the keys you entered."
      />
    </DetailPageLayout>
  );
};

export default NewConfiguration;
