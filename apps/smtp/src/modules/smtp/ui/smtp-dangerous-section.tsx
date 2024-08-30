import { useDashboardNotification } from "@saleor/apps-shared";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

import { BoxFooter } from "../../../components/box-footer";
import { BoxWithBorder } from "../../../components/box-with-border";
import { SectionWithDescription } from "../../../components/section-with-description";
import { defaultPadding } from "../../../components/ui-defaults";
import { setBackendErrors } from "../../../lib/set-backend-errors";
import { appUrls } from "../../app-configuration/urls";
import { trpcClient } from "../../trpc/trpc-client";
import { SmtpGetConfigurationIdInput } from "../configuration/smtp-config-input-schema";
import { SmtpConfiguration } from "../configuration/smtp-config-schema";

interface SmtpDangerousSectionProps {
  configuration: SmtpConfiguration;
}

export const SmtpDangerousSection = ({ configuration }: SmtpDangerousSectionProps) => {
  const { notifySuccess, notifyError } = useDashboardNotification();
  const { replace } = useRouter();
  const { handleSubmit, setError } = useForm<SmtpGetConfigurationIdInput>({
    defaultValues: {
      id: configuration.id,
    },
  });

  const { mutate } = trpcClient.smtpConfiguration.deleteConfiguration.useMutation({
    onSuccess: async () => {
      notifySuccess("Configuration removed");
      replace(appUrls.configuration());
    },
    onError(error) {
      setBackendErrors<SmtpGetConfigurationIdInput>({
        error,
        setError,
        notifyError,
      });
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
        <BoxWithBorder backgroundColor="critical1" borderColor="critical1">
          <Box padding={defaultPadding} display="flex" flexDirection="column" gap={2}>
            <Text size={5} fontWeight="bold" as="h1">
              Remove provider configuration
            </Text>
            <Text as="p">
              This operation will remove all settings related to this configuration. Data will be
              permanently removed from the App.
            </Text>
            <Text as="p">This operation can&#39;t be undone.</Text>
            <Text as="p">You can still create a new configuration.</Text>
          </Box>
          <BoxFooter borderColor="critical1">
            <Button variant="error" type="submit">
              Remove configuration
            </Button>
          </BoxFooter>
        </BoxWithBorder>
      </form>
    </SectionWithDescription>
  );
};
