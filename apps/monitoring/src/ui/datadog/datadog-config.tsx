import { useForm } from "react-hook-form";
import {
  DataDogCredentialsInput,
  DatadogSite,
  useConfigQuery,
  Mutation,
  useUpdateCredentialsMutation,
  useDeleteDatadogCredentialsMutation,
} from "../../../generated/graphql";
import { Section } from "../sections";
import { Box, BoxProps, Text } from "@saleor/macaw-ui/next";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import DatadogLogo from "../../assets/datadog/dd_logo_h_rgb.svg";
import { gql, useMutation } from "urql";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useRouter } from "next/router";

import { API_KEYS_LINKS } from "../../datadog-urls";
import { useDashboardNotification } from "@saleor/apps-shared";
import { Input, Select, Toggle } from "@saleor/react-hook-form-macaw";

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
      <a
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
      </a>
    </span>
  );
};

export const DatadogConfig = () => {
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
    return <Text>Loading</Text>;
  }

  return (
    <Section>
      <div>
        <button>back</button>
        <Text>Configuration</Text>
        <Image width={100} src={DatadogLogo} alt="DataDog" />
      </div>
      <form
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
          <Toggle control={control} name={"active"} />

          <Text>Datadog Site</Text>
          <Select
            options={Object.values(DatadogSite).map((v) => ({
              label: v,
              value: v,
            }))}
            control={control}
            name={"site"}
          />
        </div>
        <Input
          label="Api Key"
          defaultValue=""
          helperText={<ApiKeyHelperText site={activeSite} />}
          control={control}
          name={"apiKey"}
        />
        {queryData.data?.integrations.datadog?.error && (
          <Text color={"textCriticalDefault"}>{queryData.data?.integrations.datadog?.error}</Text>
        )}
        <button type="submit">Save configuration</button>
        <button
          type="reset"
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
        </button>
      </form>
    </Section>
  );
};
