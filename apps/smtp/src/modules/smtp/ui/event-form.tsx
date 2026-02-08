import { zodResolver } from "@hookform/resolvers/zod";
import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { Box, Button, Select, Text } from "@saleor/macaw-ui";
import { Input } from "@saleor/react-hook-form-macaw";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { setBackendErrors } from "../../../lib/set-backend-errors";
import { examplePayloads } from "../../event-handlers/default-payloads";
import {
  MessageEventTypes,
  messageEventTypes,
  messageEventTypesLabels,
} from "../../event-handlers/message-event-types";
import { trpcClient } from "../../trpc/trpc-client";
import { SmtpUpdateEvent, smtpUpdateEventSchema } from "../configuration/smtp-config-input-schema";
import { SmtpConfiguration } from "../configuration/smtp-config-schema";
import { smtpUrls } from "../urls";
import { CodeEditor } from "./code-editor";
import { SaleorThrobber } from "./saleor-throbber";
import { TabButton } from "./tab-button";
import { TemplateErrorDisplay } from "./template-error-display";
import { TemplatePreview } from "./template-preview";
import { useTemplatePreview } from "./use-template-preview";

type EditorTabValue = "template" | "variables";

const TEMPLATE_OPTIONS = messageEventTypes.map((type) => ({
  value: type,
  label: messageEventTypesLabels[type],
}));

const extractSelectValue = (value: string | { value: string }): string =>
  typeof value === "string" ? value : value.value;

interface TemplateSwitchConfirmationProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const TemplateSwitchConfirmation = ({ onConfirm, onCancel }: TemplateSwitchConfirmationProps) => (
  <Box
    marginTop={2}
    padding={3}
    backgroundColor="default2"
    borderRadius={2}
    display="flex"
    flexDirection="column"
    gap={2}
  >
    <Text size={2}>You have unsaved changes. Switch anyway?</Text>
    <Box display="flex" gap={2}>
      <Button variant="primary" size="small" type="button" onClick={onConfirm}>
        Switch
      </Button>
      <Button variant="tertiary" size="small" type="button" onClick={onCancel}>
        Cancel
      </Button>
    </Box>
  </Box>
);

interface EventFormProps {
  configuration: SmtpConfiguration;
  eventType: MessageEventTypes;
}

export const EventForm = ({ configuration, eventType }: EventFormProps) => {
  const router = useRouter();
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
    reset,
    getValues,
    formState: { isDirty, dirtyFields },
  } = useForm<SmtpUpdateEvent>({
    defaultValues: {
      id: configuration.id,
      ...eventConfiguration,
    },
    resolver: zodResolver(smtpUpdateEventSchema),
  });

  const watchedTemplate = watch("template");
  const watchedSubject = watch("subject");

  const [activeTab, setActiveTab] = useState<EditorTabValue>("template");
  const [pendingEventType, setPendingEventType] = useState<MessageEventTypes | null>(null);

  const initialPayload = useMemo(
    () => JSON.stringify(examplePayloads[eventType], undefined, 2),
    [eventType],
  );
  const [payload, setPayload] = useState<string>(initialPayload);
  const isPayloadDirty = payload !== initialPayload;
  const hasUnsavedChanges = isDirty || isPayloadDirty;

  const {
    renderedTemplate,
    renderedSubject,
    error: previewError,
    isLoading: isFetchingPreview,
  } = useTemplatePreview({
    template: watchedTemplate,
    subject: watchedSubject,
    payload,
  });

  const trpcContext = trpcClient.useContext();
  const { mutate, isLoading: isSaving } = trpcClient.smtpConfiguration.updateEvent.useMutation({
    onSuccess: () => {
      notifySuccess("Configuration saved");
      trpcContext.smtpConfiguration.invalidate();
      setPendingEventType(null);
      reset(getValues());
    },
    onError(error) {
      setBackendErrors<SmtpUpdateEvent>({
        error,
        setError,
        notifyError,
      });
    },
  });

  const handleEventTypeChange = (newEventType: MessageEventTypes) => {
    if (newEventType === eventType) return;

    if (hasUnsavedChanges) {
      setPendingEventType(newEventType);

      return;
    }

    router.push(smtpUrls.eventConfiguration(configuration.id, newEventType));
  };

  const confirmTemplateSwitch = () => {
    if (pendingEventType) {
      router.push(smtpUrls.eventConfiguration(configuration.id, pendingEventType));
    }
  };

  const cancelTemplateSwitch = () => {
    setPendingEventType(null);
  };

  return (
    <form
      onSubmit={handleSubmit((data) => mutate(data))}
      style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
    >
      <Box display="flex" gap={4} marginBottom={4} flexShrink="0" alignItems="flex-start">
        <Box style={{ flex: 1 }}>
          <Select
            label="Email template"
            options={TEMPLATE_OPTIONS}
            value={eventType}
            onChange={(value) =>
              handleEventTypeChange(extractSelectValue(value) as MessageEventTypes)
            }
            size="medium"
          />
          {pendingEventType && (
            <TemplateSwitchConfirmation
              onConfirm={confirmTemplateSwitch}
              onCancel={cancelTemplateSwitch}
            />
          )}
        </Box>
        <Box style={{ flex: 2 }}>
          <Input control={control} name="subject" label="Subject" />
        </Box>
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
              subject={renderedSubject}
              template={renderedTemplate}
              isUpdating={isFetchingPreview}
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
