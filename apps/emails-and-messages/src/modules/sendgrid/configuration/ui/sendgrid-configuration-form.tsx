import { Controller, useForm } from "react-hook-form";
import {
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  TextFieldProps,
  Typography,
} from "@material-ui/core";
import { Button, makeStyles, SwitchSelector, SwitchSelectorButton } from "@saleor/macaw-ui";
import React, { useEffect, useState } from "react";
import { SendgridConfiguration } from "../sendgrid-config";
import { trpcClient } from "../../../trpc/trpc-client";
import { useAppBridge, actions } from "@saleor/app-sdk/app-bridge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSenders } from "../../sendgrid-api";
import { useDashboardNotification } from "@saleor/apps-shared";

const useStyles = makeStyles((theme) => ({
  field: {
    marginBottom: 20,
  },
  editor: {
    marginBottom: 20,
  },
  preview: {
    marginBottom: 20,
  },
  sectionHeader: {
    marginTop: 20,
  },
}));

type Props = {
  onConfigurationSaved: () => void;
  initialData: SendgridConfiguration;
  configurationId?: string;
};

export const SendgridConfigurationForm = (props: Props) => {
  const styles = useStyles();
  const { appBridge } = useAppBridge();
  const { notifySuccess, notifyError } = useDashboardNotification();
  const [senderId, setSenderId] = useState<string | undefined>(undefined);

  const { handleSubmit, control, reset, setError, setValue } = useForm<SendgridConfiguration>({
    defaultValues: props.initialData,
  });

  const { data: sendersChoices, isLoading: isSendersChoicesLoading } = useQuery({
    queryKey: ["sendgridSenders"],
    queryFn: fetchSenders({ apiKey: props.initialData.apiKey }),
    enabled: !!props.initialData.apiKey?.length,
    onSuccess(data) {
      // we are not keeping senders ID in the database, so we need to find the ID of the sender
      // configuration contains nickname and email set up in the Sendgrid account
      if (data.length) {
        const sender = data?.find((sender) => sender.from_email === props.initialData.senderEmail);
        if (sender?.value) {
          setSenderId(sender?.value);
        }
      }
    },
  });

  const queryClient = useQueryClient();

  const { mutate: createOrUpdateConfiguration } =
    trpcClient.sendgridConfiguration.updateOrCreateConfiguration.useMutation({
      onSuccess: async (data, variables) => {
        await queryClient.cancelQueries({
          queryKey: ["sendgridConfiguration", "getConfigurations"],
        });

        // Optimistically update to the new value
        queryClient.setQueryData<Array<SendgridConfiguration>>(
          ["sendgridConfiguration", "getConfigurations", undefined],
          (old) => {
            if (old) {
              const index = old.findIndex((c) => c.id === data.id);
              // If thats an update, replace the old one
              if (index !== -1) {
                old[index] = data;
                return [...old];
              } else {
                return [...old, data];
              }
            } else {
              return [data];
            }
          }
        );

        // Trigger refetch to make sure we have a fresh data
        props.onConfigurationSaved();
        notifySuccess("Configuration saved");
      },
      onError(error) {
        let isFieldErrorSet = false;
        const fieldErrors = error.data?.zodError?.fieldErrors || {};
        for (const fieldName in fieldErrors) {
          for (const message of fieldErrors[fieldName] || []) {
            isFieldErrorSet = true;
            setError(fieldName as keyof SendgridConfiguration, {
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

  // when the configuration tab is changed, initialData change and form has to be updated
  useEffect(() => {
    reset(props.initialData);
  }, [props.initialData, props.configurationId, reset]);

  // fill sender email and name when sender is changed
  useEffect(() => {
    const sender = sendersChoices?.find((choice) => choice.value === senderId);
    if (sender) {
      setValue("senderName", sender.nickname);
      setValue("senderEmail", sender.from_email);
    } else {
      setValue("senderName", undefined);
      setValue("senderEmail", undefined);
    }
  }, [senderId, sendersChoices]);

  const CommonFieldProps: TextFieldProps = {
    className: styles.field,
    fullWidth: true,
  };

  const isNewConfiguration = !props.configurationId;

  return (
    <form
      onSubmit={handleSubmit((data, event) => {
        createOrUpdateConfiguration({
          ...data,
        });
      })}
    >
      {isNewConfiguration ? (
        <Typography variant="h2" paragraph>
          Create a new configuration
        </Typography>
      ) : (
        <Typography variant="h2" paragraph>
          Configuration
          <strong>{` ${props.initialData.configurationName} `}</strong>
        </Typography>
      )}

      <Controller
        name="configurationName"
        control={control}
        render={({ field: { onChange, value }, fieldState: { error }, formState: { errors } }) => (
          <TextField
            label="Configuration name"
            value={value}
            onChange={onChange}
            error={!!error}
            helperText={
              error?.message || "Name of the configuration, for example 'Production' or 'Test'"
            }
            {...CommonFieldProps}
          />
        )}
      />

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

      <Divider />

      <Typography variant="h3" paragraph className={styles.sectionHeader}>
        API configuration
      </Typography>

      <Controller
        name="apiKey"
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <TextField
            label="Sendgrid API key"
            value={value}
            onChange={onChange}
            helperText={
              error?.message ||
              "The API key can be generated at Sendgrid dashboard, in the Settings / API Keys section"
            }
            error={!!error}
            {...CommonFieldProps}
          />
        )}
      />

      <Controller
        control={control}
        name="sandboxMode"
        render={({ field: { value, name, onChange } }) => (
          <div className={styles.field}>
            {/* TODO: fix types in the MacawUI */}
            {/* @ts-ignore: MacawUI use wrong type for */}
            <SwitchSelector key={name} className={styles.field}>
              {[
                { label: "Live", value: false },
                { label: "Sandbox", value: true },
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

      <Divider />

      {/* Sender can be chosen after the API key is saved in the configuration */}
      {!isNewConfiguration && (
        <>
          <Typography variant="h3" paragraph className={styles.sectionHeader}>
            Sender details
          </Typography>

          <FormControl className={styles.field} fullWidth>
            <InputLabel>Sender</InputLabel>
            <Select
              variant="outlined"
              value={senderId}
              disabled={isSendersChoicesLoading}
              onChange={(event, val) => {
                if (val) {
                  const node = val as React.ReactElement;
                  setSenderId(node.props.value);
                  return;
                }
                setSenderId(undefined);
              }}
            >
              <MenuItem key="none" value={undefined}>
                No sender
              </MenuItem>
              {!!sendersChoices &&
                sendersChoices.map((choice) => (
                  <MenuItem key={choice.value} value={choice.value}>
                    {choice.label}
                  </MenuItem>
                ))}
            </Select>
            {!sendersChoices?.length && (
              <Typography variant="caption" color="textSecondary">
                Please set up and verify senders in your Sendgrid dashboard.
              </Typography>
            )}
          </FormControl>

          <Controller
            name="senderName"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <TextField
                label="Sender name"
                disabled={true}
                error={!!error}
                helperText={error?.message}
                value={value}
                onChange={onChange}
                {...CommonFieldProps}
              />
            )}
          />

          <Controller
            name="senderEmail"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <TextField
                  label="Sender email"
                  value={value}
                  disabled={true}
                  helperText={error?.message}
                  error={!!error}
                  onChange={onChange}
                  {...CommonFieldProps}
                />
              </>
            )}
          />
        </>
      )}
      <Button type="submit" fullWidth variant="primary">
        Save configuration
      </Button>
    </form>
  );
};
