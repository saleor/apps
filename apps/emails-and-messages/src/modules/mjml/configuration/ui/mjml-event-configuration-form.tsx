import { Controller, useForm } from "react-hook-form";
import { CircularProgress, TextField, TextFieldProps, Typography } from "@material-ui/core";
import {
  BackSmallIcon,
  Button,
  IconButton,
  makeStyles,
  SwitchSelector,
  SwitchSelectorButton,
} from "@saleor/macaw-ui";
import React, { useEffect, useState } from "react";
import { MjmlEventConfiguration } from "../mjml-config";
import { CodeEditor } from "../../../ui/code-editor";
import { MjmlPreview } from "./mjml-preview";
import {
  MessageEventTypes,
  messageEventTypesLabels,
} from "../../../event-handlers/message-event-types";
import { trpcClient } from "../../../trpc/trpc-client";
import { useDebounce } from "usehooks-ts";
import { useRouter } from "next/router";
import { mjmlUrls } from "../../urls";
import { useAppBridge, actions } from "@saleor/app-sdk/app-bridge";
import { examplePayloads } from "../../../event-handlers/default-payloads";

const PREVIEW_DEBOUNCE_DELAY = 500;

const useStyles = makeStyles((theme) => ({
  header: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: theme.spacing(1),
    padding: theme.spacing(3),
    maxWidth: 1180,
    margin: "0 auto",
  },
  previewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(3),
  },

  field: {
    marginBottom: theme.spacing(3),
  },
  editor: {
    marginBottom: theme.spacing(3),
  },
  preview: {
    marginBottom: theme.spacing(3),
  },
  form: {
    padding: theme.spacing(3),
  },
  formAndPreviewSection: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    alignItems: "start",
    gap: 32,
    maxWidth: 1180,
    margin: "0 auto",
  },
}));

type EventConfigurationFormProps = {
  initialData: MjmlEventConfiguration;
  configurationId: string;
  eventType: MessageEventTypes;
};

export const EventConfigurationForm = ({
  initialData,
  configurationId,
  eventType,
}: EventConfigurationFormProps) => {
  const router = useRouter();
  const { appBridge } = useAppBridge();
  const { handleSubmit, control, getValues, setError } = useForm<MjmlEventConfiguration>({
    defaultValues: initialData,
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

  const styles = useStyles();

  const CommonFieldProps: TextFieldProps = {
    className: styles.field,
    fullWidth: true,
  };

  const { mutate: fetchTemplatePreview, isLoading: isFetchingTemplatePreview } =
    trpcClient.mjmlConfiguration.renderTemplate.useMutation({
      onSuccess: (data) => {
        if (data.renderedEmailBody) {
          setLastValidRenderedTemplate(data.renderedEmailBody);
        }
        if (data.renderedSubject) {
          setLastValidRenderedSubject(data.renderedSubject);
        }
      },
    });

  const { mutate: updateEventConfiguration, isLoading: isFetchingUpdateEvent } =
    trpcClient.mjmlConfiguration.updateEventConfiguration.useMutation({
      onSuccess: (data) => {
        appBridge?.dispatch(
          actions.Notification({
            title: "Configuration saved",
            status: "success",
          })
        );
      },
      onError: (error) => {
        let isFieldErrorSet = false;
        const fieldErrors = error.data?.zodError?.fieldErrors || {};
        for (const fieldName in fieldErrors) {
          for (const message of fieldErrors[fieldName] || []) {
            isFieldErrorSet = true;
            setError(fieldName as keyof MjmlEventConfiguration, {
              type: "manual",
              message,
            });
          }
        }
        const formErrors = error.data?.zodError?.formErrors || [];
        const formErrorMessage = formErrors.length ? formErrors.join("\n") : undefined;
        appBridge?.dispatch(
          actions.Notification({
            title: "Could not save the configuration",
            text: isFieldErrorSet ? "Submitted form contain errors" : "Error saving configuration",
            apiMessage: formErrorMessage,
            status: "error",
          })
        );
      },
    });

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
    <div>
      <div className={styles.header}>
        <IconButton
          variant="secondary"
          onClick={() => {
            router.push(mjmlUrls.configuration(configurationId));
          }}
        >
          <BackSmallIcon />
        </IconButton>
        <Typography variant="h2">
          {messageEventTypesLabels[eventType]} event configuration
        </Typography>
      </div>
      <div className={styles.formAndPreviewSection}>
        <form
          onSubmit={handleSubmit((data, event) => {
            updateEventConfiguration({ ...data, configurationId });
          })}
          className={styles.form}
        >
          <Controller
            control={control}
            name="active"
            render={({ field: { value, name, onChange } }) => (
              <div className={styles.field}>
                {/* TODO: fix types in the MacawUI */}
                {/* @ts-ignore: MacawUI use wrong type for */}
                <SwitchSelector key={name} className={styles.field}>
                  {[
                    { label: "Active", value: true },
                    { label: "Disabled", value: false },
                  ].map((button) => (
                    // @ts-ignore: MacawUI use wrong type for SwitchSelectorButton
                    <SwitchSelectorButton
                      value={button.value.toString()}
                      onClick={() => onChange(button.value)}
                      activeTab={value.toString()}
                      key={button.label}
                    >
                      {button.label}
                    </SwitchSelectorButton>
                  ))}
                </SwitchSelector>
              </div>
            )}
          />

          <Controller
            name="subject"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <TextField
                label="Email subject"
                value={value}
                onChange={onChange}
                error={!!error}
                helperText={
                  !error
                    ? "You can use variables like {{ order.number }} or {{ order.userEmail }}"
                    : error.message
                }
                {...CommonFieldProps}
              />
            )}
          />

          <Controller
            control={control}
            name="template"
            render={({ field: { value, onChange } }) => {
              return (
                <>
                  <div className={styles.editor}>
                    <CodeEditor
                      initialTemplate={value}
                      value={value}
                      onChange={onChange}
                      language="xml"
                    />
                  </div>
                </>
              );
            }}
          />
          <Button type="submit" fullWidth variant="primary">
            Save configuration
          </Button>
        </form>
        <div>
          <div className={styles.previewHeader}>
            <Typography variant="h2">Preview</Typography>
            {isFetchingTemplatePreview && <CircularProgress size="3rem" color="primary" />}
          </div>
          <Typography variant="h3" paragraph>
            Subject: {lastValidRenderedSubject}
          </Typography>
          <div className={styles.preview}>
            <MjmlPreview value={lastValidRenderedTemplate} />
          </div>
          <CodeEditor
            initialTemplate={payload}
            value={payload}
            onChange={setPayload}
            language="json"
          />
        </div>
      </div>
    </div>
  );
};
