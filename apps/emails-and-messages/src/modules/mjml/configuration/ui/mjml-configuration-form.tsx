import { Controller, useForm } from "react-hook-form";
import { Divider, TextField, TextFieldProps, Typography } from "@material-ui/core";
import { Button, makeStyles, SwitchSelector, SwitchSelectorButton } from "@saleor/macaw-ui";
import React, { useEffect } from "react";
import { MjmlConfiguration, smtpEncryptionTypes } from "../mjml-config";
import { trpcClient } from "../../../trpc/trpc-client";
import { useAppBridge, actions } from "@saleor/app-sdk/app-bridge";
import { useQueryClient } from "@tanstack/react-query";
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
  initialData: MjmlConfiguration;
  configurationId?: string;
};

export const MjmlConfigurationForm = (props: Props) => {
  const styles = useStyles();
  const { notifySuccess, notifyError } = useDashboardNotification();

  const { handleSubmit, control, reset, setError } = useForm<MjmlConfiguration>({
    defaultValues: props.initialData,
  });

  const queryClient = useQueryClient();

  const { mutate: createOrUpdateConfiguration } =
    trpcClient.mjmlConfiguration.updateOrCreateConfiguration.useMutation({
      onSuccess: async (data, variables) => {
        await queryClient.cancelQueries({ queryKey: ["mjmlConfiguration", "getConfigurations"] });

        // Optimistically update to the new value
        queryClient.setQueryData<Array<MjmlConfiguration>>(
          ["mjmlConfiguration", "getConfigurations", undefined],
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
            setError(fieldName as keyof MjmlConfiguration, {
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
        Sender details
      </Typography>

      <Controller
        name="senderName"
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <TextField
            label="Sender name"
            error={!!error}
            helperText={error?.message || "Name which will be presented as author of the email"}
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
              helperText={error?.message || "Email which will be presented as author of the email"}
              error={!!error}
              onChange={onChange}
              {...CommonFieldProps}
            />
          </>
        )}
      />

      <Divider />

      <Typography variant="h3" paragraph className={styles.sectionHeader}>
        SMTP server configuration
      </Typography>

      <Controller
        name="smtpHost"
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <TextField
            label="SMTP server host"
            value={value}
            onChange={onChange}
            helperText={
              error?.message ||
              "Address of the SMTP server, without the protocol. For example 'smtp.example.com'"
            }
            error={!!error}
            {...CommonFieldProps}
          />
        )}
      />

      <Controller
        name="smtpPort"
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <TextField
            label="SMTP server port"
            helperText={error?.message}
            error={!!error}
            value={value}
            onChange={onChange}
            {...CommonFieldProps}
          />
        )}
      />

      <Controller
        name="smtpUser"
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <TextField
            label="SMTP server user"
            value={value}
            helperText={error?.message}
            error={!!error}
            onChange={onChange}
            {...CommonFieldProps}
          />
        )}
      />

      <Controller
        name="smtpPassword"
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <TextField
            label="SMTP server password"
            value={value}
            helperText={error?.message}
            error={!!error}
            onChange={onChange}
            {...CommonFieldProps}
          />
        )}
      />

      <Controller
        control={control}
        name="encryption"
        render={({ field: { value, name, onChange } }) => (
          <div className={styles.field}>
            {/* TODO: fix types in the MacawUI */}
            {/* @ts-ignore: MacawUI use wrong type for SwitchSelector */}
            <SwitchSelector key={name}>
              {smtpEncryptionTypes.map((encryptionType) => (
                // @ts-ignore: MacawUI use wrong type for SwitchSelectorButton
                <SwitchSelectorButton
                  value={encryptionType}
                  onClick={() => onChange(encryptionType)}
                  activeTab={value}
                  key={encryptionType}
                >
                  {encryptionType === "NONE" ? "No encryption" : encryptionType}
                </SwitchSelectorButton>
              ))}
            </SwitchSelector>
          </div>
        )}
      />

      <Button type="submit" fullWidth variant="primary">
        Save configuration
      </Button>
    </form>
  );
};
