import { Controller, useForm } from "react-hook-form";
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextFieldProps,
  Typography,
} from "@material-ui/core";
import {
  BackSmallIcon,
  Button,
  IconButton,
  makeStyles,
  SwitchSelector,
  SwitchSelectorButton,
} from "@saleor/macaw-ui";
import React from "react";
import { SendgridConfiguration, SendgridEventConfiguration } from "../sendgrid-config";
import {
  MessageEventTypes,
  messageEventTypesLabels,
} from "../../../event-handlers/message-event-types";
import { trpcClient } from "../../../trpc/trpc-client";
import { useRouter } from "next/router";
import { sendgridUrls } from "../../urls";
import { useQuery } from "@tanstack/react-query";
import { fetchTemplates } from "../../sendgrid-api";
import { useDashboardNotification } from "@saleor/apps-shared";

const useStyles = makeStyles((theme) => ({
  viewContainer: {
    padding: theme.spacing(2),
  },
  header: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    margin: "0 auto",
  },
  previewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
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
    maxWidth: 800,
  },
}));

type EventConfigurationFormProps = {
  initialData: SendgridEventConfiguration;
  configurationId: string;
  eventType: MessageEventTypes;
  configuration: SendgridConfiguration;
};

export const EventConfigurationForm = ({
  initialData,
  configurationId,
  eventType,
  configuration,
}: EventConfigurationFormProps) => {
  const router = useRouter();
  const { notifySuccess, notifyError } = useDashboardNotification();

  const { handleSubmit, control, getValues, setError } = useForm<SendgridEventConfiguration>({
    defaultValues: initialData,
  });

  const styles = useStyles();

  const { data: templateChoices, isLoading: isTemplateChoicesLoading } = useQuery({
    queryKey: ["sendgridTemplates"],
    queryFn: fetchTemplates({ apiKey: configuration.apiKey }),
    enabled: !!configuration.apiKey?.length,
  });

  const CommonFieldProps: TextFieldProps = {
    className: styles.field,
    fullWidth: true,
  };

  const { mutate: updateEventConfiguration } =
    trpcClient.sendgridConfiguration.updateEventConfiguration.useMutation({
      onSuccess: (data) => {
        notifySuccess("Configuration saved");
      },
      onError: (error) => {
        let isFieldErrorSet = false;
        const fieldErrors = error.data?.zodError?.fieldErrors || {};
        for (const fieldName in fieldErrors) {
          for (const message of fieldErrors[fieldName] || []) {
            isFieldErrorSet = true;
            setError(fieldName as keyof SendgridEventConfiguration, {
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
    <div className={styles.viewContainer}>
      <div className={styles.header}>
        <IconButton
          variant="secondary"
          onClick={() => {
            router.push(sendgridUrls.configuration(configurationId));
          }}
        >
          <BackSmallIcon />
        </IconButton>
        <Typography variant="h2">
          {messageEventTypesLabels[eventType]} event configuration
        </Typography>
      </div>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
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
              control={control}
              name="template"
              render={({ field: { value, onChange } }) => {
                return (
                  <FormControl className={styles.field} fullWidth>
                    <InputLabel>Template</InputLabel>
                    <Select
                      variant="outlined"
                      value={value}
                      onChange={(event, val) => {
                        onChange(event.target.value);
                      }}
                    >
                      <MenuItem key="none" value={undefined}>
                        No template
                      </MenuItem>
                      {!!templateChoices &&
                        templateChoices.map((choice) => (
                          <MenuItem key={choice.value} value={choice.value}>
                            {choice.label}
                          </MenuItem>
                        ))}
                    </Select>
                    {!templateChoices?.length && (
                      <Typography variant="caption" color="textSecondary">
                        No templates found in your account. Visit Sendgrid dashboard and create one.
                      </Typography>
                    )}
                  </FormControl>
                );
              }}
            />

            <Button type="submit" fullWidth variant="primary">
              Save configuration
            </Button>
          </form>
        </Grid>
      </Grid>
    </div>
  );
};
