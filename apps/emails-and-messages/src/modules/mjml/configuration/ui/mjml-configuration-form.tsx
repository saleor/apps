import { Controller, useForm } from "react-hook-form";
import { Divider, TextField, TextFieldProps, Typography } from "@material-ui/core";
import { Button, makeStyles, SwitchSelector, SwitchSelectorButton } from "@saleor/macaw-ui";
import React, { useEffect } from "react";
import { MjmlConfiguration, smtpEncryptionTypes } from "../mjml-config";
import { trpcClient } from "../../../trpc/trpc-client";
import { useAppBridge, actions } from "@saleor/app-sdk/app-bridge";
import { useRouter } from "next/router";
import { mjmlUrls } from "../../urls";

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
  form: {},
}));

type Props = {
  onConfigurationSaved: () => void;
  initialData: MjmlConfiguration;
  configurationId?: string;
};

export const MjmlConfigurationForm = (props: Props) => {
  const styles = useStyles();
  const router = useRouter();
  const { appBridge } = useAppBridge();

  const { handleSubmit, control, setValue, getValues, reset, setError } =
    useForm<MjmlConfiguration>({
      defaultValues: props.initialData,
    });

  const { mutate: createOrUpdateConfiguration, error: createOrUpdateError } =
    trpcClient.mjmlConfiguration.updateOrCreateConfiguration.useMutation({
      onSuccess(data, variables) {
        router.replace(mjmlUrls.configuration(data.id));
        props.onConfigurationSaved();

        appBridge?.dispatch(
          actions.Notification({
            title: "Configuration saved",
            status: "success",
          })
        );
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
      className={styles.form}
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
            helperText={error?.message}
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
              helperText={error?.message}
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
            helperText={error?.message}
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

      {createOrUpdateError && <span>{createOrUpdateError.message}</span>}
    </form>
  );
};
