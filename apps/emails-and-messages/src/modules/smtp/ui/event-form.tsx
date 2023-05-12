import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { SmtpConfiguration } from "../configuration/smtp-config-schema";
import { MessageEventTypes } from "../../event-handlers/message-event-types";
import { Input } from "../../../components/react-hook-form-macaw/Input";
import { useDashboardNotification } from "@saleor/apps-shared";
import { trpcClient } from "../../trpc/trpc-client";
import { useForm } from "react-hook-form";
import {
  SmtpUpdateEventConfigurationInput,
  smtpUpdateEventConfigurationInputSchema,
} from "../configuration/smtp-config-input-schema";
import { zodResolver } from "@hookform/resolvers/zod";

interface EventFormProps {
  configuration: SmtpConfiguration;
  eventType: MessageEventTypes;
}

export const EventForm = ({ configuration, eventType }: EventFormProps) => {
  const { notifySuccess, notifyError } = useDashboardNotification();

  const eventConfiguration = configuration?.events.find(
    (eventConfiguration) => eventConfiguration.eventType === eventType
  )!; // Event conf is not optional, so we can use ! here

  const { handleSubmit, control, getValues, setError } = useForm<SmtpUpdateEventConfigurationInput>(
    {
      defaultValues: {
        id: configuration.id,
        ...eventConfiguration,
      },
      resolver: zodResolver(smtpUpdateEventConfigurationInputSchema),
    }
  );

  const trpcContext = trpcClient.useContext();
  const { mutate } = trpcClient.smtpConfiguration.updateSender.useMutation({
    onSuccess: async () => {
      notifySuccess("Configuration saved");
      trpcContext.smtpConfiguration.invalidate();
    },
    onError(error) {
      let isFieldErrorSet = false;
      const fieldErrors = error.data?.zodError?.fieldErrors || {};

      for (const fieldName in fieldErrors) {
        for (const message of fieldErrors[fieldName] || []) {
          isFieldErrorSet = true;
          setError(fieldName as keyof SmtpUpdateEventConfigurationInput, {
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
    <Box>
      <form>
        <Box display="flex" justifyContent="space-between">
          <Text variant="hero">Edit template</Text>
          <Button>Save</Button>
        </Box>
        <Box display={"grid"} gridTemplateColumns={{ desktop: 3, mobile: 1 }}>
          <Input control={control} name="subject" label="Subject"></Input>
        </Box>
      </form>
    </Box>
  );
};
