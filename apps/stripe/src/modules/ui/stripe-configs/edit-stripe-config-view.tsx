import { zodResolver } from "@hookform/resolvers/zod";
import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { useUnsavedChangesGuard } from "@saleor/apps-shared/use-unsaved-changes-guard";
import { DeleteConfigurationModalContent } from "@saleor/apps-ui";
import {
  DetailPageLayout,
  ExitFormDialog,
  Savebar,
  SettingsFieldStack,
  SettingsPageContent,
  SettingsSection,
} from "@saleor/apps-ui-next";
import { Box, Modal } from "@saleor/macaw-ui";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  StripeFrontendConfig,
  type StripeFrontendConfigSerializedFields,
} from "@/modules/app-config/domain/stripe-config";
import { trpcClient } from "@/modules/trpc/trpc-client";
import { KeyPrefix } from "@/modules/ui/key-prefix";
import { editStripeConfigFormSchema } from "@/modules/ui/stripe-configs/edit-stripe-config-form-schema";
import {
  FieldHint,
  StripeConfigFields,
  type StripeConfigFormShape,
} from "@/modules/ui/stripe-configs/stripe-config-fields";
import { StripeEnvBadge } from "@/modules/ui/stripe-configs/stripe-env-badge";
import { StripeModeLegend } from "@/modules/ui/stripe-setup/stripe-mode-legend";

const FORM_ID = "edit_stripe_config_form";
const CONFIG_LIST_PATH = "/config";

export const EditStripeConfigView = ({
  config,
}: {
  config: StripeFrontendConfigSerializedFields;
}) => {
  const { notifyError, notifySuccess } = useDashboardNotification();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const configInstance = StripeFrontendConfig.createFromSerializedFields(config);

  const {
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<StripeConfigFormShape>({
    defaultValues: {
      name: config.name,
      publishableKey: config.publishableKey,
      /** Only the last characters of the saved key are known here, so it starts empty. */
      restrictedKey: "",
    },
    resolver: zodResolver(editStripeConfigFormSchema),
  });

  /**
   * Submitting is not enough to drop the guard: react-hook-form reports a successful submit as
   * soon as the mutation is fired, while the changes are only safe once the server accepted them.
   */
  const [isSaved, setIsSaved] = useState(false);

  const guard = useUnsavedChangesGuard({ enabled: isDirty && !isSaved });

  const {
    mutate: updateConfig,
    isLoading: isSaving,
    isError: isSaveError,
  } = trpcClient.appConfig.updateStripeConfig.useMutation({
    onSuccess() {
      notifySuccess("Configuration updated");
      setIsSaved(true);

      guard.navigateWithoutGuard(CONFIG_LIST_PATH);
    },
    onError(error) {
      notifyError("Error updating config", error.message);
    },
  });

  const { mutate: removeConfig, isLoading: isDeleting } =
    trpcClient.appConfig.removeStripeConfig.useMutation({
      onSuccess() {
        notifySuccess("Configuration deleted");
        setIsSaved(true);

        guard.navigateWithoutGuard(CONFIG_LIST_PATH);
      },
      onError(error) {
        notifyError("Error deleting config", error.message);
      },
    });

  const isBusy = isSaving || isDeleting;

  return (
    <>
      <DetailPageLayout.Content>
        <SettingsPageContent
          description={
            <>
              Rename this configuration or replace its Stripe keys. Which channels use it stays on
              the configuration list.
            </>
          }
          aside={<StripeModeLegend />}
        >
          <Modal open={isDeleteModalOpen} onChange={() => setIsDeleteModalOpen(false)}>
            <DeleteConfigurationModalContent
              onDeleteClick={() => {
                removeConfig({ configId: config.id });
                setIsDeleteModalOpen(false);
              }}
            />
          </Modal>

          <Box
            as="form"
            id={FORM_ID}
            onSubmit={handleSubmit((values) =>
              updateConfig({
                configId: config.id,
                name: values.name,
                publishableKey: values.publishableKey,
                restrictedKey: values.restrictedKey === "" ? null : values.restrictedKey,
              }),
            )}
          >
            <SettingsSection
              title="Stripe keys"
              ownership="channel"
              description="Keys are used by every channel assigned to this configuration."
              headerEnd={<StripeEnvBadge env={configInstance.getStripeEnvValue()} />}
              data-test-id="stripe-edit-config-card"
            >
              <SettingsFieldStack>
                <StripeConfigFields
                  control={control}
                  errors={errors}
                  disabled={isBusy}
                  restrictedKey={{
                    optional: true,
                    helperText: (
                      <FieldHint term="Restricted key">
                        is already saved and ends with{" "}
                        <KeyPrefix size={2}>{config.restrictedKey.replace(/^\.+/, "")}</KeyPrefix>.
                        Leave empty to keep it, or paste a new key to replace it.
                      </FieldHint>
                    ),
                  }}
                />
              </SettingsFieldStack>
            </SettingsSection>
          </Box>
        </SettingsPageContent>
      </DetailPageLayout.Content>

      <Savebar>
        <Savebar.DeleteButton disabled={isBusy} onClick={() => setIsDeleteModalOpen(true)}>
          Delete
        </Savebar.DeleteButton>
        <Savebar.Spacer />
        <Savebar.CancelButton
          disabled={isBusy}
          onClick={() => guard.navigateWithoutGuard(CONFIG_LIST_PATH)}
        >
          Cancel
        </Savebar.CancelButton>
        <Savebar.ConfirmButton
          form={FORM_ID}
          disabled={!isDirty || isBusy}
          transitionState={isSaving ? "loading" : isSaveError ? "error" : "default"}
        >
          Save
        </Savebar.ConfirmButton>
      </Savebar>

      <ExitFormDialog
        isOpen={guard.isBlocked}
        onClose={guard.keepEditing}
        onLeave={guard.leave}
        description="Changes to this configuration have not been saved yet."
      />
    </>
  );
};
