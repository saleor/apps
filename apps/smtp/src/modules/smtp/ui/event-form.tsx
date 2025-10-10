import { zodResolver } from "@hookform/resolvers/zod";
import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { Input } from "@saleor/react-hook-form-macaw";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDebounce } from "usehooks-ts";

import { defaultPadding } from "../../../components/ui-defaults";
import { setBackendErrors } from "../../../lib/set-backend-errors";
import { examplePayloads } from "../../event-handlers/default-payloads";
import { MessageEventTypes } from "../../event-handlers/message-event-types";
import { trpcClient } from "../../trpc/trpc-client";
import { SmtpUpdateEvent, smtpUpdateEventSchema } from "../configuration/smtp-config-input-schema";
import { SmtpConfiguration } from "../configuration/smtp-config-schema";
import { CodeEditor } from "./code-editor";
import { TemplateErrorDisplay } from "./template-error-display";
import { TemplatePreview } from "./template-preview";

const PREVIEW_DEBOUNCE_DELAY = 500;

interface EventFormProps {
  configuration: SmtpConfiguration;
  eventType: MessageEventTypes;
}

export const EventForm = ({ configuration, eventType }: EventFormProps) => {
  const { notifySuccess, notifyError } = useDashboardNotification();

  const eventConfiguration = configuration?.events.find(
    (eventConfiguration) => eventConfiguration.eventType === eventType,
  )!; // Event conf is not optional, so we can use ! here

  const { handleSubmit, control, getValues, setError } = useForm<SmtpUpdateEvent>({
    defaultValues: {
      id: configuration.id,
      ...eventConfiguration,
    },
    resolver: zodResolver(smtpUpdateEventSchema),
  });

  const trpcContext = trpcClient.useContext();
  const { mutate } = trpcClient.smtpConfiguration.updateEvent.useMutation({
    onSuccess: async () => {
      notifySuccess("Configuration saved");
      trpcContext.smtpConfiguration.invalidate();
    },
    onError(error) {
      setBackendErrors<SmtpUpdateEvent>({
        error,
        setError,
        notifyError,
      });
    },
  });

  const [lastValidRenderedTemplate, setLastValidRenderedTemplate] = useState("");
  const [lastValidRenderedSubject, setLastValidRenderedSubject] = useState("");
  const [lastError, setLastError] = useState<typeof _error | null>(null);
  const [payload, setPayload] = useState<string>(
    JSON.stringify(examplePayloads[eventType], undefined, 2),
  );

  const {
    mutate: fetchTemplatePreview,
    isLoading: isFetchingTemplatePreview,
    error: _error,
  } = trpcClient.smtpConfiguration.renderTemplate.useMutation({
    onSuccess: (data) => {
      setLastError(null);

      if (data.renderedEmailBody) {
        setLastValidRenderedTemplate(data.renderedEmailBody);
      }
      if (data.renderedSubject) {
        setLastValidRenderedSubject(data.renderedSubject);
      }
    },
    onError: (err) => {
      setLastError(err);
    },
  });

  const { template, subject } = getValues();
  const debouncedMutationVariables = useDebounce(
    { template, subject, payload },
    PREVIEW_DEBOUNCE_DELAY,
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
      onSubmit={handleSubmit((data) => {
        mutate({
          ...data,
        });
      })}
    >
      <Box display="flex" flexDirection="column" gap={defaultPadding}>
        <Box display="flex" justifyContent="space-between">
          <Text size={10} fontWeight="bold">
            Edit template
          </Text>
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
            {lastError ? (
              <TemplateErrorDisplay error={lastError} />
            ) : (
              <TemplatePreview
                subject={lastValidRenderedSubject}
                template={lastValidRenderedTemplate}
                isUpdating={isFetchingTemplatePreview}
              />
            )}
          </Box>
        </Box>
        <Box display="flex" justifyContent="flex-end" gap={2} alignItems="center">
          {lastError && (
            <Text size={3} color="critical1">
              Fix template errors before saving
            </Text>
          )}
          <Button type="submit" disabled={!!lastError}>
            Save
          </Button>
        </Box>
      </Box>
    </form>
  );
};
