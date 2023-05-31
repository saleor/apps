import { SmtpConfiguration } from "../configuration/smtp-config-schema";
import { BoxWithBorder } from "../../../components/box-with-border";
import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { defaultPadding } from "../../../components/ui-defaults";
import { useDashboardNotification } from "@saleor/apps-shared";
import { trpcClient } from "../../trpc/trpc-client";
import { useForm } from "react-hook-form";
import { BoxFooter } from "../../../components/box-footer";
import { SectionWithDescription } from "../../../components/section-with-description";
import { SmtpUpdateSmtp, smtpUpdateSmtpSchema } from "../configuration/smtp-config-input-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { setBackendErrors } from "../../../lib/set-backend-errors";
import { Input } from "@saleor/react-hook-form-macaw";

interface SmtpSectionProps {
  configuration: SmtpConfiguration;
}

export const SmtpSection = ({ configuration }: SmtpSectionProps) => {
  const { notifySuccess, notifyError } = useDashboardNotification();
  const { handleSubmit, control, setError, register } = useForm<SmtpUpdateSmtp>({
    defaultValues: {
      id: configuration.id,
      smtpHost: configuration.smtpHost,
      smtpPort: configuration.smtpPort,
      smtpUser: configuration.smtpUser,
      smtpPassword: configuration.smtpPassword,
      encryption: configuration.encryption,
    },
    resolver: zodResolver(smtpUpdateSmtpSchema),
  });

  const trpcContext = trpcClient.useContext();
  const { mutate } = trpcClient.smtpConfiguration.updateSmtp.useMutation({
    onSuccess: async () => {
      notifySuccess("Configuration saved");
      trpcContext.smtpConfiguration.invalidate();
    },
    onError(error) {
      setBackendErrors<SmtpUpdateSmtp>({
        error,
        setError,
        notifyError,
      });
    },
  });

  return (
    <SectionWithDescription
      title="Connect SMTP server"
      description={<Text>Provide SMTP server configuration</Text>}
    >
      <BoxWithBorder>
        <form
          onSubmit={handleSubmit((data, event) => {
            mutate({
              ...data,
            });
          })}
        >
          <Box padding={defaultPadding} display="flex" flexDirection="column" gap={10}>
            <Input
              label="Host"
              helperText="Server host that will be connected."
              control={control}
              name="smtpHost"
            />
            <Input
              label="Port"
              name="smtpPort"
              control={control}
              helperText="Port that will be used"
            />
            <Input
              label="User"
              name="smtpUser"
              control={control}
              helperText="User for the SMTP server connection"
            />
            <Input
              label="Password"
              name="smtpPassword"
              control={control}
              helperText="Password for the SMTP server connection"
            />

            <Box display="flex" gap={defaultPadding}>
              <label>
                <input {...register("encryption")} type="radio" value="NONE" />
                <Text paddingLeft={defaultPadding}>No encryption</Text>
              </label>
              <label>
                <input {...register("encryption")} type="radio" value="SSL" />
                <Text paddingLeft={defaultPadding}>SSL</Text>
              </label>
              <label>
                <input {...register("encryption")} type="radio" value="TLS" />
                <Text paddingLeft={defaultPadding}>TLS</Text>
              </label>
            </Box>
          </Box>
          <BoxFooter>
            <Button type="submit">Save provider</Button>
          </BoxFooter>
        </form>
      </BoxWithBorder>
    </SectionWithDescription>
  );
};
