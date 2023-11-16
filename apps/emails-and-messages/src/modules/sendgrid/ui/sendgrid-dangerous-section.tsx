import { Box, Button, Text } from "@saleor/macaw-ui";
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
import { setBackendErrors } from "../../../lib/set-backend-errors";

interface SendgridDangerousSectionProps {
  configuration: SendgridConfiguration;
}

export const SendgridDangerousSection = ({ configuration }: SendgridDangerousSectionProps) => {
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
      setBackendErrors<SendgridGetConfigurationIdInput>({ error, setError, notifyError });
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
        <BoxWithBorder backgroundColor="surfaceCriticalSubdued" borderColor="criticalSubdued">
          <Box padding={defaultPadding} display="flex" flexDirection="column" gap={2}>
            <Text variant="heading" as="h1">
              Remove provider configuration
            </Text>
            <Text as="p">
              This operation will remove all settings related to this configuration. Data will be
              permanently removed from the App.
            </Text>
            <Text as="p">This operation can&#39;t be undone.</Text>
            <Text as="p">You can still create a new configuration.</Text>
          </Box>
          <BoxFooter borderColor="criticalSubdued">
            <Button variant="error" type="submit">
              Remove configuration
            </Button>
          </BoxFooter>
        </BoxWithBorder>
      </form>
    </SectionWithDescription>
  );
};
