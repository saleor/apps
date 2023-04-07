import { Controller, useForm } from "react-hook-form";
import {
  DataDogCredentialsInput,
  DatadogSite,
  useConfigQuery,
  Mutation,
  useUpdateCredentialsMutation,
  useDeleteDatadogCredentialsMutation,
} from "../../../generated/graphql";
import { Section } from "../sections";
import {
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  TextField,
  Typography,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Link,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Button, makeStyles, Backlink, IconButton } from "@saleor/macaw-ui";
import Image from "next/image";
import DatadogLogo from "../../assets/datadog/dd_logo_h_rgb.svg";
import { gql, useMutation } from "urql";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { ArrowBack } from "@material-ui/icons";
import { useRouter } from "next/router";

import { API_KEYS_LINKS } from "../../datadog-urls";
import { useDashboardNotification } from "@saleor/apps-shared";

const useStyles = makeStyles({
  form: {
    marginTop: 50,
    display: "grid",
    gridAutoFlow: "row",
    gap: 30,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headline: {
    marginRight: "auto",
    marginLeft: 10,
  },
});

gql`
  query Config {
    integrations {
      datadog {
        error
        active
        credentials {
          apiKeyLast4
          site
        }
      }
    }
  }
`;

gql`
  mutation UpdateCredentials($input: DatadogConfigInput!) {
    updateDatadogConfig(input: $input) {
      datadog {
        error
        active
        credentials {
          apiKeyLast4
          site
        }
      }
      errors {
        message
        field
      }
    }
  }
`;

gql`
  mutation DeleteDatadogCredentials {
    deleteDatadogConfig {
      errors {
        field
        message
      }
      datadog {
        credentials {
          site
          apiKeyLast4
        }
      }
    }
  }
`;

const buildMaskedKey = (keyLastChars: string) => `************${keyLastChars}`;

const ApiKeyHelperText = ({ site }: { site: DatadogSite }) => {
  const url = API_KEYS_LINKS[site];
  const { appBridge } = useAppBridge();

  return (
    <span>
      Get one{" "}
      <Link
        href={url}
        onClick={(e) => {
          e.preventDefault();
          appBridge?.dispatch(
            actions.Redirect({
              to: url,
              newContext: true,
            })
          );
        }}
      >
        here
      </Link>
    </span>
  );
};

export const DatadogConfig = () => {
  const styles = useStyles();
  const [queryData, fetchConfig] = useConfigQuery();
  const [, mutateCredentials] = useUpdateCredentialsMutation();
  const [, deleteCredentials] = useDeleteDatadogCredentialsMutation();
  const router = useRouter();
  const { notifyError, notifySuccess } = useDashboardNotification();

  const { register, handleSubmit, setValue, control, reset, watch } = useForm<
    DataDogCredentialsInput & {
      active: boolean;
    }
  >({
    defaultValues: {
      site: DatadogSite.Us1,
      apiKey: "",
      active: true,
    },
  });

  const activeSite = watch("site");

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateValuesToCurrentConfig = () => {
    const datadogConfig = queryData.data?.integrations.datadog;

    if (!datadogConfig) {
      return;
    }

    setValue("active", datadogConfig.active);
    setValue("apiKey", buildMaskedKey(datadogConfig.credentials.apiKeyLast4));
    setValue("site", datadogConfig.credentials.site);
  };

  useEffect(() => {
    const datadogConfig = queryData.data?.integrations.datadog;

    if (datadogConfig) {
      updateValuesToCurrentConfig();
    }
  }, [queryData.data, setValue]);

  if (queryData.fetching && !queryData.data) {
    return <LinearProgress />;
  }

  return (
    <Section>
      <div className={styles.header}>
        <IconButton
          onClick={() => {
            router.push("/configuration");
          }}
          variant="secondary"
        >
          <ArrowBack />
        </IconButton>
        <Typography className={styles.headline} variant="h3">
          Configuration
        </Typography>
        <Image width={100} src={DatadogLogo} alt="DataDog" />
      </div>
      <form
        className={styles.form}
        onSubmit={handleSubmit((values) => {
          return mutateCredentials({
            input: {
              active: values.active,
              credentials: {
                apiKey: values.apiKey,
                site: values.site,
              },
            },
          }).then((res) => {
            const updatedConfig = res.data?.updateDatadogConfig.datadog;
            const errors = res.data?.updateDatadogConfig.errors;

            if (updatedConfig) {
              setValue("active", updatedConfig.active);
              setValue("apiKey", buildMaskedKey(updatedConfig.credentials.apiKeyLast4));
              setValue("site", updatedConfig.credentials.site);

              notifySuccess("Configuration updated", "Successfully updated Datadog settings");
            }

            if (errors?.length) {
              notifyError("Error configuring Datadog", errors[0].message);
            }
          });
        })}
      >
        <div>
          <Controller
            render={({ field }) => {
              return (
                <FormGroup row>
                  <FormControlLabel
                    control={<Checkbox checked={field.value} {...field} />}
                    label="Enabled"
                  />
                </FormGroup>
              );
            }}
            name="active"
            control={control}
          />
          <InputLabel id="datadog-site-label">Datadog Site</InputLabel>
          <Select
            defaultValue={DatadogSite.Us1}
            fullWidth
            labelId="datadog-site-label"
            {...register("site")}
          >
            {Object.values(DatadogSite).map((v) => (
              <MenuItem value={v} key={v}>
                {v}
              </MenuItem>
            ))}
          </Select>
        </div>
        <TextField
          fullWidth
          variant="standard"
          label="Api Key"
          defaultValue=""
          helperText={<ApiKeyHelperText site={activeSite} />}
          {...register("apiKey")}
        />
        {queryData.data?.integrations.datadog?.error && (
          <Typography color="error">{queryData.data?.integrations.datadog?.error}</Typography>
        )}
        <Button type="submit" variant="primary" fullWidth>
          Save configuration
        </Button>
        <Button
          type="reset"
          variant="secondary"
          fullWidth
          onClick={(e) => {
            e.preventDefault();

            deleteCredentials({}).then(() => {
              fetchConfig();
              reset();
              notifySuccess("Configuration updated", "Successfully deleted Datadog settings");
            });
          }}
        >
          Delete configuration
        </Button>
      </form>
    </Section>
  );
};
