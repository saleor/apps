import { zodResolver } from "@hookform/resolvers/zod";
import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { Input } from "@saleor/react-hook-form-macaw";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDebounce } from "usehooks-ts";

import { setBackendErrors } from "../../../lib/set-backend-errors";
import { examplePayloads } from "../../event-handlers/default-payloads";
import { MessageEventTypes } from "../../event-handlers/message-event-types";
import { trpcClient } from "../../trpc/trpc-client";
import { SmtpUpdateEvent, smtpUpdateEventSchema } from "../configuration/smtp-config-input-schema";
import { SmtpConfiguration } from "../configuration/smtp-config-schema";
import { CodeEditor } from "./code-editor";
import { SaleorThrobber } from "./saleor-throbber";
import { TabButton } from "./tab-button";
import { TemplateErrorDisplay } from "./template-error-display";
import { TemplatePreview } from "./template-preview";

const PREVIEW_DEBOUNCE_DELAY = 500;

type EditorTabValue = "template" | "variables";

type RenderTemplateError = ReturnType<
  typeof trpcClient.smtpConfiguration.renderTemplate.useMutation
>["error"];

interface EventFormProps {
  configuration: SmtpConfiguration;
  eventType: MessageEventTypes;
}

export const EventForm = ({ configuration, eventType }: EventFormProps) => {
  const { notifySuccess, notifyError } = useDashboardNotification();

  const eventConfiguration = configuration.events.find((e) => e.eventType === eventType);

  if (!eventConfiguration) {
    throw new Error(`Event configuration not found for event type: ${eventType}`);
  }

  const {
    handleSubmit,
    control,
    watch,
    setError,
    formState: { dirtyFields },
  } = useForm<SmtpUpdateEvent>({
    defaultValues: {
      id: configuration.id,
      ...eventConfiguration,
    },
    resolver: zodResolver(smtpUpdateEventSchema),
  });

  const watchedTemplate = watch("template");
  const watchedSubject = watch("subject");

  const trpcContext = trpcClient.useContext();
  const { mutate, isLoading: isSaving } = trpcClient.smtpConfiguration.updateEvent.useMutation({
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

  const [activeTab, setActiveTab] = useState<EditorTabValue>("template");
  const [lastValidRenderedTemplate, setLastValidRenderedTemplate] = useState("");
  const [lastValidRenderedSubject, setLastValidRenderedSubject] = useState("");
  const [previewError, setPreviewError] = useState<RenderTemplateError>(null);

  const initialPayload = useMemo(
    () => JSON.stringify(examplePayloads[eventType], undefined, 2),
    [eventType],
  );
  const [payload, setPayload] = useState<string>(initialPayload);
  const isPayloadDirty = payload !== initialPayload;

  const { mutate: fetchTemplatePreview, isLoading: isFetchingTemplatePreview } =
    trpcClient.smtpConfiguration.renderTemplate.useMutation({
      onSuccess: (data) => {
        setPreviewError(null);

        if (data.renderedEmailBody) {
          setLastValidRenderedTemplate(data.renderedEmailBody);
        }
        if (data.renderedSubject) {
          setLastValidRenderedSubject(data.renderedSubject);
        }
      },
      onError: (error) => {
        setPreviewError(error);
      },
    });

  const debouncedMutationVariables = useDebounce(
    { template: watchedTemplate, subject: watchedSubject, payload },
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
      onSubmit={handleSubmit((data) => mutate(data))}
      style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
    >
      <Box marginBottom={4} flexShrink="0">
        <Input control={control} name="subject" label="Subject" />
      </Box>

      <Box display="flex" gap={4} flexGrow="1" __minHeight="0">
        <Box
          display="flex"
          flexDirection="column"
          borderRadius={4}
          borderWidth={1}
          borderStyle="solid"
          borderColor="default1"
          backgroundColor="default1"
          style={{ flex: 3, minWidth: 0, overflow: "hidden" }}
        >
          <Box
            display="flex"
            flexShrink="0"
            borderBottomWidth={1}
            borderBottomStyle="solid"
            borderColor="default1"
          >
            <TabButton
              active={activeTab === "template"}
              onClick={() => setActiveTab("template")}
              isDirty={dirtyFields.template}
            >
              MJML Template
            </TabButton>
            <TabButton
              active={activeTab === "variables"}
              onClick={() => setActiveTab("variables")}
              isDirty={isPayloadDirty}
            >
              Test Variables
            </TabButton>
          </Box>

          <Box style={{ flex: 1, minHeight: 0, position: "relative" }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: activeTab === "template" ? 1 : 0,
                visibility: activeTab === "template" ? "visible" : "hidden",
              }}
            >
              <Controller
                control={control}
                name="template"
                render={({ field: { value, onChange } }) => (
                  <CodeEditor
                    initialTemplate={value}
                    value={value}
                    onChange={onChange}
                    language="xml"
                    height="100%"
                  />
                )}
              />
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: activeTab === "variables" ? 1 : 0,
                visibility: activeTab === "variables" ? "visible" : "hidden",
              }}
            >
              <CodeEditor
                initialTemplate={payload}
                value={payload}
                onChange={setPayload}
                language="json"
                height="100%"
              />
            </div>
          </Box>
        </Box>

        <Box display="flex" flexDirection="column" style={{ flex: 2, minWidth: 0 }}>
          {previewError ? (
            <TemplateErrorDisplay error={previewError} />
          ) : (
            <TemplatePreview
              subject={lastValidRenderedSubject}
              template={lastValidRenderedTemplate}
              isUpdating={isFetchingTemplatePreview}
            />
          )}
        </Box>
      </Box>

      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        gap={2}
        paddingTop={4}
        flexShrink="0"
      >
        {previewError && (
          <Text size={2} color="critical1">
            Fix template errors before saving
          </Text>
        )}
        <Button type="submit" disabled={!!previewError || isSaving}>
          {isSaving ? (
            <Box display="flex" alignItems="center" gap={2}>
              <SaleorThrobber size={20} />
              <span>Saving</span>
            </Box>
          ) : (
            "Save"
          )}
        </Button>
      </Box>
    </form>
  );
};
