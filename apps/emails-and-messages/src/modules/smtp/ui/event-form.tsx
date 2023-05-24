import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { SmtpConfiguration } from "../configuration/smtp-config-schema";
import { MessageEventTypes } from "../../event-handlers/message-event-types";
import { Input } from "../../../components/react-hook-form-macaw/Input";
import { useDashboardNotification } from "@saleor/apps-shared";
import { trpcClient } from "../../trpc/trpc-client";
import { Controller, useForm } from "react-hook-form";
import {
  SmtpUpdateEventConfigurationInput,
  smtpUpdateEventConfigurationInputSchema,
} from "../configuration/smtp-config-input-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CodeEditor } from "./code-edtor";
import { useDebounce } from "usehooks-ts";
import { useState, useEffect } from "react";
import { examplePayloads } from "../../event-handlers/default-payloads";
import { MjmlPreview } from "./mjml-preview";
import { defaultPadding } from "../../../components/ui-defaults";
import { setBackendErrors } from "../../../lib/set-backend-errors";
const PREVIEW_DEBOUNCE_DELAY = 500;

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
      setBackendErrors<SmtpUpdateEventConfigurationInput>({
        error,
        setError,
        notifyError,
      });
    },
  });

  const { mutate: fetchTemplatePreview, isLoading: isFetchingTemplatePreview } =
    trpcClient.smtpConfiguration.renderTemplate.useMutation({
      onSuccess: (data) => {
        if (data.renderedEmailBody) {
          setLastValidRenderedTemplate(data.renderedEmailBody);
        }
        if (data.renderedSubject) {
          setLastValidRenderedSubject(data.renderedSubject);
        }
      },
    });

  const [lastValidRenderedTemplate, setLastValidRenderedTemplate] = useState("");

  const [lastValidRenderedSubject, setLastValidRenderedSubject] = useState("");

  const [payload, setPayload] = useState<string>(
    JSON.stringify(examplePayloads[eventType], undefined, 2)
  );

  const { template, subject } = getValues();
  const debouncedMutationVariables = useDebounce(
    { template, subject, payload },
    PREVIEW_DEBOUNCE_DELAY
  );

  const {
    template: debouncedTemplate,
    subject: debouncedSubject,
    payload: debouncedPayload,
  } = debouncedMutationVariables;

  useEffect(() => {
    fetchTemplatePreview({
      template: debouncedTemplate,
      subject: debouncedSubject,
      payload: debouncedPayload,
    });
  }, [debouncedPayload, debouncedSubject, debouncedTemplate, fetchTemplatePreview]);

  return (
    <form
      onSubmit={handleSubmit((data, event) => {
        mutate({
          ...data,
        });
      })}
    >
      <Box display="flex" flexDirection="column" gap={defaultPadding}>
        <Box display="flex" justifyContent="space-between">
          <Text variant="hero">Edit template</Text>
          <Button type="submit">Save</Button>
        </Box>
        <Box display="grid" gridTemplateColumns={{ desktop: 3, mobile: 1 }}>
          <Input control={control} name="subject" label="Subject" />
        </Box>

        <Box display="grid" gridTemplateColumns={{ desktop: 5, mobile: 1 }} gap={defaultPadding}>
          <Box
            gridColumnStart={{ desktop: "1", mobile: "1" }}
            gridColumnEnd={{ desktop: "3", mobile: "6" }}
          >
            <Controller
              control={control}
              name="template"
              render={({ field: { value, onChange } }) => {
                return (
                  <CodeEditor
                    initialTemplate={value}
                    value={value}
                    onChange={onChange}
                    language="xml"
                  />
                );
              }}
            />
          </Box>
          <Box
            gridColumnStart={{ desktop: "3", mobile: "1" }}
            gridColumnEnd={{ desktop: "5", mobile: "6" }}
          >
            <CodeEditor
              initialTemplate={payload}
              value={payload}
              onChange={setPayload}
              language="json"
            />
          </Box>
          <Box
            gridColumnStart={{ desktop: "5", mobile: "1" }}
            gridColumnEnd={{ desktop: "6", mobile: "6" }}
            display="flex"
            flexDirection="column"
            gap={defaultPadding}
          >
            <Text variant="heading" as="p">
              Subject: {lastValidRenderedSubject}
            </Text>
            <MjmlPreview value={lastValidRenderedTemplate} />
          </Box>
        </Box>
      </Box>
    </form>
  );
};
