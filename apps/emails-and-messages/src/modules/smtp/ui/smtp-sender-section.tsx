import { SmtpConfiguration } from "../configuration/smtp-config-schema";
import { BoxWithBorder } from "../../../components/box-with-border";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { defaultPadding } from "../../../components/ui-defaults";
import { useDashboardNotification } from "@saleor/apps-shared";
import { trpcClient } from "../../trpc/trpc-client";
import { useForm } from "react-hook-form";
import { BoxFooter } from "../../../components/box-footer";
import { SectionWithDescription } from "../../../components/section-with-description";
import {
  SmtpUpdateSender,
  smtpUpdateSenderSchema,
} from "../configuration/smtp-config-input-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { setBackendErrors } from "../../../lib/set-backend-errors";
import { Input } from "@saleor/react-hook-form-macaw";

interface SmtpSenderSectionProps {
  configuration: SmtpConfiguration;
}

export const SmtpSenderSection = ({ configuration }: SmtpSenderSectionProps) => {
  const { notifySuccess, notifyError } = useDashboardNotification();
  const { handleSubmit, control, setError, register } = useForm<SmtpUpdateSender>({
    defaultValues: {
      id: configuration.id,
      senderName: configuration.senderName,
      senderEmail: configuration.senderEmail,
    },
    resolver: zodResolver(smtpUpdateSenderSchema),
  });

  const trpcContext = trpcClient.useContext();
  const { mutate } = trpcClient.smtpConfiguration.updateSender.useMutation({
    onSuccess: async () => {
      notifySuccess("Configuration saved");
      trpcContext.smtpConfiguration.invalidate();
    },
    onError(error) {
      setBackendErrors<SmtpUpdateSender>({
        error,
        setError,
        notifyError,
      });
    },
  });

  return (
    <SectionWithDescription
      title="Sender"
      description={
        <Box display="flex" flexDirection="column" gap={2}>
          <Text as="p">
            Sender&apos;s name and email address will be displayed as the author of an email.
          </Text>
          <Text as="p">Setting up the sender is required to send emails.</Text>
        </Box>
      }
    >
      <BoxWithBorder>
        <form
          onSubmit={handleSubmit((data, event) => {
            mutate({
              ...data,
            });
          })}
        >
          <Box padding={defaultPadding} display="flex" flexDirection="column" gap={7}>
            <Input
              label="Email"
              name="senderEmail"
              control={control}
              helperText="Email address that will be used as sender"
            />
            <Input
              label="Name"
              name="senderName"
              control={control}
              helperText="Name that will be used as sender"
            />
          </Box>
          <BoxFooter>
            <Button type="submit">Save provider</Button>
          </BoxFooter>
        </form>
      </BoxWithBorder>
    </SectionWithDescription>
  );
};
