import { zodResolver } from "@hookform/resolvers/zod";
import { Grid, TextField, Typography } from "@material-ui/core";
import { Button, makeStyles } from "@saleor/macaw-ui";
import React from "react";
import { Path, useForm } from "react-hook-form";
import {
  CMSProviderSchema,
  providersConfig,
  ProvidersSchema,
  providersSchemaSet,
  SingleProviderSchema,
} from "../../../lib/cms/config";
import { Provider } from "../../providers/config";
import { AppMarkdownText } from "../../ui/app-markdown-text";
import { ZodNumber } from "zod";

const useStyles = makeStyles((theme) => ({
  footer: {
    display: "flex",
    justifyContent: "flex-end",
  },
  footerComplex: {
    display: "flex",
    justifyContent: "space-between",
  },
}));

interface ProviderInstanceConfigurationFormProps<TProvider extends CMSProviderSchema> {
  provider: Provider;
  providerInstance?: SingleProviderSchema | null;
  onSubmit: (provider: SingleProviderSchema) => any;
  onDelete: (provider: SingleProviderSchema) => any;
  loading: boolean;
}

export const ProviderInstanceConfigurationForm = <TProvider extends CMSProviderSchema>({
  provider,
  providerInstance,
  onSubmit,
  onDelete,
  loading,
}: ProviderInstanceConfigurationFormProps<TProvider>) => {
  const styles = useStyles();

  const schema = providersSchemaSet[provider.name as TProvider];
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    resetField,
    control,
    formState,
    trigger,
    unregister,
    watch,
  } = useForm<ProvidersSchema[TProvider]>({
    resolver: zodResolver(schema),
  });

  React.useEffect(() => {
    resetField("providerName" as Path<ProvidersSchema[TProvider]>, {
      defaultValue: provider.name,
    });

    if (providerInstance && providerInstance.providerName === provider.name) {
      reset(providerInstance as ProvidersSchema[TProvider]);
    }
  }, [provider, providerInstance]);

  const submitHandler = (values: SingleProviderSchema) => {
    onSubmit(values);
  };

  const fields = providersConfig[provider.name as TProvider].tokens;
  const errors = formState.errors;

  const getOptionalText = (token: Record<string, unknown>) =>
    "required" in token && token.required ? "" : "*Optional. ";

  return (
    <form onSubmit={handleSubmit(submitHandler)}>
      <Grid container spacing={1}>
        {!!Object.entries(errors).length && (
          <Typography variant="body1" color="error">
            Error validating form
          </Typography>
        )}
        <input
          type="hidden"
          {...register("providerName" as Path<ProvidersSchema[TProvider]>)}
          value={provider.name}
        />
        <Grid item xs={12}>
          <TextField
            {...register("name" as Path<ProvidersSchema[TProvider]>)}
            label="Configuration name"
            type="text"
            name="name"
            InputLabelProps={{
              shrink: !!watch("name" as Path<ProvidersSchema[TProvider]>),
            }}
            fullWidth
            error={!!errors.name}
            helperText={
              <>
                {errors.name?.message ||
                  "Used to differentiate configuration instance. You may create multiple instances of provider configuration, e.g. Contentful Prod, Contentful Test, etc."}
              </>
            }
          />
        </Grid>
        {fields.map((token) => {
          const isSecret = token.secret ? { type: "password" } : {};

          return (
            <Grid xs={12} item key={token.name}>
              <TextField
                {...register(token.name as Path<ProvidersSchema[TProvider]>, {
                  required: "required" in token && token.required,
                  valueAsNumber:
                    schema.shape[token.name as keyof typeof schema.shape] instanceof ZodNumber,
                })}
                {...isSecret}
                label={token.label}
                name={token.name}
                InputLabelProps={{
                  shrink: !!watch(token.name as Path<ProvidersSchema[TProvider]>),
                }}
                fullWidth
                // @ts-ignore TODO: fix errors typing
                error={!!errors[token.name as Path<ProvidersSchema[TProvider]>]}
                helperText={
                  <>
                    {errors[token.name as Path<ProvidersSchema[TProvider]>]?.message ||
                      ("helpText" in token && (
                        <AppMarkdownText>{`${getOptionalText(token)}${
                          token.helpText
                        }`}</AppMarkdownText>
                      ))}
                  </>
                }
              />
            </Grid>
          );
        })}
        {providerInstance ? (
          <Grid item xs={12}>
            <TextField
              {...register("id" as Path<ProvidersSchema[TProvider]>)}
              label="Configuration id"
              type="text"
              name="id"
              fullWidth
              helperText="Automatically generated unique identifier for the configuration instance."
              disabled={true}
            />
          </Grid>
        ) : (
          <input type="hidden" {...register("id" as Path<ProvidersSchema[TProvider]>)} />
        )}
        <Grid item xs={12} className={providerInstance ? styles.footerComplex : styles.footer}>
          {providerInstance && (
            <Button variant="secondary" disabled={loading} onClick={() => onDelete(getValues())}>
              Delete
            </Button>
          )}
          <Button variant="primary" disabled={loading} type="submit">
            {loading ? "..." : providerInstance ? "Save" : "Add"}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};
