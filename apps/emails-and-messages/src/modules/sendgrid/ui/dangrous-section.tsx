import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { BoxWithBorder } from "../../../components/box-with-border";
import { SectionWithDescription } from "../../../components/section-with-description";
import { defaultPadding } from "../../../components/ui-defaults";
import { BoxFooter } from "../../../components/box-footer";
import { SendgridConfiguration } from "../configuration/sendgrid-config-schema";
import { trpcClient } from "../../trpc/trpc-client";
import { useDashboardNotification } from "@saleor/apps-shared";
import { useForm } from "react-hook-form";
import { SendgridGetConfigurationIdInput } from "../configuration/sendgrid-config-input-schema";
import { useRouter } from "next/router";
import { appUrls } from "../../app-configuration/urls";

interface DangerousSectionProps {
  configuration: SendgridConfiguration;
}

export const DangerousSection = ({ configuration }: DangerousSectionProps) => {
  const { notifySuccess, notifyError } = useDashboardNotification();
  const { replace } = useRouter();
  const { handleSubmit, setError } = useForm<SendgridGetConfigurationIdInput>({
    defaultValues: {
      id: configuration.id,
    },
  });

  const { mutate } = trpcClient.sendgridConfiguration.deleteConfiguration.useMutation({
    onSuccess: async () => {
      notifySuccess("Configuration removed");
      replace(appUrls.configuration());
    },
    onError(error) {
      let isFieldErrorSet = false;
      const fieldErrors = error.data?.zodError?.fieldErrors || {};
      for (const fieldName in fieldErrors) {
        for (const message of fieldErrors[fieldName] || []) {
          isFieldErrorSet = true;
          setError(fieldName as keyof SendgridGetConfigurationIdInput, {
            type: "manual",
            message,
          });
        }
      }
      const formErrors = error.data?.zodError?.formErrors || [];
      const formErrorMessage = formErrors.length ? formErrors.join("\n") : undefined;

      notifyError(
        "Could not save the configuration",
        isFieldErrorSet ? "Submitted form contain errors" : "Error saving configuration",
        formErrorMessage
      );
    },
  });

  return (
    <SectionWithDescription title="Danger zone">
      <form
        onSubmit={handleSubmit((data, event) => {
          mutate({
            ...data,
          });
        })}
      >
        <BoxWithBorder backgroundColor={"surfaceCriticalSubdued"} borderColor={"criticalSubdued"}>
          <Box padding={defaultPadding}>
            <Text variant="heading" display="block">
              Remove provider
            </Text>
            <Text display="block">You can remove provider configuration.</Text>
            <Text display="block">
              This operation will remove all settings related to this configuration. Data will be
              permanently removed from the App.{" "}
            </Text>
            <Text display="block">This operation cant be undone.</Text>
            <Text display="block">You still can create new configuration.</Text>
          </Box>
          <BoxFooter borderColor={"criticalSubdued"}>
            <Button
              color={"textNeutralSubdued"}
              backgroundColor={"interactiveCriticalDefault"}
              type="submit"
            >
              Remove provider
            </Button>
          </BoxFooter>
        </BoxWithBorder>
      </form>
    </SectionWithDescription>
  );
};
