import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { BoxWithBorder } from "../../../components/box-with-border";
import { SectionWithDescription } from "../../../components/section-with-description";
import { defaultPadding } from "../../../components/ui-defaults";
import { BoxFooter } from "../../../components/box-footer";
import { trpcClient } from "../../trpc/trpc-client";
import { useDashboardNotification } from "@saleor/apps-shared";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { SmtpConfiguration } from "../configuration/smtp-config-schema";
import { SmtpGetConfigurationIdInput } from "../configuration/smtp-config-input-schema";
import { setBackendErrors } from "../../../lib/set-backend-errors";

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
      replace("/configuration");
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
        <BoxWithBorder backgroundColor="surfaceCriticalSubdued" borderColor="criticalSubdued">
          <Box padding={defaultPadding}>
            <Text variant="heading" as="h1">
              Remove provider
            </Text>
            <Text as="p">You can remove provider configuration.</Text>
            <Text as="p">
              This operation will remove all settings related to this configuration. Data will be
              permanently removed from the App.
            </Text>
            <Text as="p">This operation cant be undone.</Text>
            <Text as="p">You still can create new configuration.</Text>
          </Box>
          <BoxFooter borderColor="criticalSubdued">
            <Button
              color="textNeutralSubdued"
              backgroundColor="interactiveCriticalDefault"
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
