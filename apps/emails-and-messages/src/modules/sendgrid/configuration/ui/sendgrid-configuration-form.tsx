import { Controller, useForm } from "react-hook-form";
import {
  FormControl,
  FormControlLabel,
  InputLabel,
  Switch,
  TextField,
  TextFieldProps,
  Typography,
} from "@material-ui/core";
import { Button, makeStyles } from "@saleor/macaw-ui";
import React, { useEffect } from "react";
import { SendgridConfiguration } from "../sendgrid-config";
import { useQuery } from "@tanstack/react-query";
import { TemplateSelectionField } from "./template-selection-field";
import { fetchTemplates } from "./fetch-templates";

const useStyles = makeStyles({
  field: {
    marginBottom: 20,
  },
  form: {
    padding: 20,
  },
});

type Props = {
  onSubmit(data: SendgridConfiguration): Promise<void>;
  initialData: SendgridConfiguration;
  configurationId?: string;
};

export const SendgridConfigurationForm = (props: Props) => {
  const { handleSubmit, control, reset } = useForm<SendgridConfiguration>({
    defaultValues: props.initialData,
  });

  // when the configuration tab is changed, initialData change and form has to be updated
  useEffect(() => {
    reset(props.initialData);
  }, [props.initialData, reset]);

  const { data: templateChoices, isLoading: isTemplateChoicesLoading } = useQuery({
    queryKey: ["sendgridTemplates"],
    queryFn: fetchTemplates({ apiKey: props.initialData.apiKey }),
    enabled: !!props.initialData?.apiKey.length,
  });

  const styles = useStyles();

  const CommonFieldProps: TextFieldProps = {
    className: styles.field,
    fullWidth: true,
  };

  const isNewConfiguration = !props.configurationId;

  return (
    <form
      onSubmit={handleSubmit((data, event) => {
        props.onSubmit(data);
      })}
      className={styles.form}
    >
      {isNewConfiguration ? (
        <Typography variant="h4" paragraph>
          Create a new configuration
        </Typography>
      ) : (
        <Typography variant="h4" paragraph>
          Configuration {props.initialData?.configurationName}
        </Typography>
      )}
      <Controller
        control={control}
        name="active"
        render={({ field: { value, onChange } }) => {
          return (
            <FormControlLabel
              control={
                <Switch value={value} checked={value} onChange={(event, val) => onChange(val)} />
              }
              label="Active"
            />
          );
        }}
      />
      <Controller
        control={control}
        name="sandboxMode"
        render={({ field: { value, onChange } }) => {
          return (
            <FormControlLabel
              control={
                <Switch value={value} checked={value} onChange={(event, val) => onChange(val)} />
              }
              label="Sandbox mode"
            />
          );
        }}
      />
      <Controller
        name="configurationName"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextField
            label="Configuration name"
            value={value}
            onChange={onChange}
            {...CommonFieldProps}
          />
        )}
      />
      <Controller
        name="senderName"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextField label="Sender name" value={value} onChange={onChange} {...CommonFieldProps} />
        )}
      />
      <Controller
        name="senderEmail"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextField label="Sender email" value={value} onChange={onChange} {...CommonFieldProps} />
        )}
      />
      <Controller
        name="apiKey"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextField label="API key" value={value} onChange={onChange} {...CommonFieldProps} />
        )}
      />
      <Controller
        name="templateOrderCreatedSubject"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextField
            label="Order Created Email subject"
            value={value}
            onChange={onChange}
            {...CommonFieldProps}
          />
        )}
      />

      <Controller
        control={control}
        name="templateOrderCreatedTemplate"
        render={({ field: { value, onChange } }) => {
          return (
            <FormControl className={styles.field} disabled={isTemplateChoicesLoading} fullWidth>
              <InputLabel>Template for Order Created</InputLabel>
              <TemplateSelectionField
                value={value}
                onChange={onChange}
                templateChoices={templateChoices}
              />
            </FormControl>
          );
        }}
      />

      <Controller
        name="templateOrderFulfilledSubject"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextField
            label="Order Fulfilled Email subject"
            value={value}
            onChange={onChange}
            {...CommonFieldProps}
          />
        )}
      />

      <Controller
        control={control}
        name="templateOrderFulfilledTemplate"
        render={({ field: { value, onChange } }) => {
          return (
            <FormControl className={styles.field} disabled={isTemplateChoicesLoading} fullWidth>
              <InputLabel>Template for Order Fulfilled</InputLabel>
              <TemplateSelectionField
                value={value}
                onChange={onChange}
                templateChoices={templateChoices}
              />
            </FormControl>
          );
        }}
      />

      <Controller
        name="templateOrderConfirmedSubject"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextField
            label="Order Confirmed Email subject"
            value={value}
            onChange={onChange}
            {...CommonFieldProps}
          />
        )}
      />

      <Controller
        control={control}
        name="templateOrderConfirmedTemplate"
        render={({ field: { value, onChange } }) => {
          return (
            <FormControl className={styles.field} disabled={isTemplateChoicesLoading} fullWidth>
              <InputLabel>Template for Order Confirmed</InputLabel>
              <TemplateSelectionField
                value={value}
                onChange={onChange}
                templateChoices={templateChoices}
              />
            </FormControl>
          );
        }}
      />

      <Controller
        name="templateOrderCancelledSubject"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextField
            label="Order Cancelled Email subject"
            value={value}
            onChange={onChange}
            {...CommonFieldProps}
          />
        )}
      />

      <Controller
        control={control}
        name="templateOrderCancelledTemplate"
        render={({ field: { value, onChange } }) => {
          return (
            <FormControl className={styles.field} disabled={isTemplateChoicesLoading} fullWidth>
              <InputLabel>Template for Order Cancelled</InputLabel>
              <TemplateSelectionField
                value={value}
                onChange={onChange}
                templateChoices={templateChoices}
              />
            </FormControl>
          );
        }}
      />

      <Controller
        name="templateOrderFullyPaidSubject"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextField
            label="Order Fully Paid Email subject"
            value={value}
            onChange={onChange}
            {...CommonFieldProps}
          />
        )}
      />

      <Controller
        control={control}
        name="templateOrderFullyPaidTemplate"
        render={({ field: { value, onChange } }) => {
          return (
            <FormControl className={styles.field} disabled={isTemplateChoicesLoading} fullWidth>
              <InputLabel>Template for Order Fully Paid</InputLabel>
              <TemplateSelectionField
                value={value}
                onChange={onChange}
                templateChoices={templateChoices}
              />
            </FormControl>
          );
        }}
      />

      <Controller
        name="templateInvoiceSentSubject"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextField
            label="Invoice sent Email subject"
            value={value}
            onChange={onChange}
            {...CommonFieldProps}
          />
        )}
      />

      <Controller
        control={control}
        name="templateInvoiceSentTemplate"
        render={({ field: { value, onChange } }) => {
          return (
            <FormControl className={styles.field} disabled={isTemplateChoicesLoading} fullWidth>
              <InputLabel>Template for Invoice Sent</InputLabel>
              <TemplateSelectionField
                value={value}
                onChange={onChange}
                templateChoices={templateChoices}
              />
            </FormControl>
          );
        }}
      />

      <Button type="submit" fullWidth variant="primary">
        Save configuration
      </Button>
    </form>
  );
};
