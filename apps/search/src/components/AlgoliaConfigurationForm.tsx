import { useAuthenticatedFetch } from "@saleor/app-sdk/app-bridge";

import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { AlgoliaConfigurationFields } from "../lib/algolia/types";
import { fetchConfiguration } from "../lib/configuration";
import { Box, Button, Input, Text, Divider } from "@saleor/macaw-ui/next";
import { useDashboardNotification } from "@saleor/apps-shared";
import { AlgoliaSearchProvider } from "../lib/algolia/algoliaSearchProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

export const AlgoliaConfigurationForm = () => {
  const { notifyError, notifySuccess } = useDashboardNotification();
  const fetch = useAuthenticatedFetch();

  const [credentialsValidationError, setCredentialsValidationError] = useState(false);

  const { handleSubmit, trigger, setValue, control } = useForm<AlgoliaConfigurationFields>({
    defaultValues: { appId: "", indexNamePrefix: "", secretKey: "" },
    resolver: zodResolver(
      z.object({
        appId: z.string().min(3),
        indexNamePrefix: z.string(),

        secretKey: z.string().min(3),
      })
    ),
  });

  const reactQueryClient = useQueryClient();
  /**
   * TODO Extract to hook
   */
  const { isLoading: isQueryLoading } = useQuery({
    queryKey: ["configuration"],
    onSuccess(data) {
      setValue("secretKey", data?.secretKey || "");
      setValue("appId", data?.appId || "");
      setValue("indexNamePrefix", data?.indexNamePrefix || "");
    },
    queryFn: async () => fetchConfiguration(fetch),
  });

  const { mutate, isLoading: isMutationLoading } = useMutation(
    async (conf: AlgoliaConfigurationFields) => {
      const resp = await fetch("/api/configuration", {
        method: "POST",
        body: JSON.stringify(conf),
      });

      if (resp.status >= 200 && resp.status < 300) {
        const data = (await resp.json()) as { data?: AlgoliaConfigurationFields };

        return data.data;
      }
      throw new Error(`Server responded with status code ${resp.status}`);
    },
    {
      onSuccess: async () => {
        reactQueryClient.refetchQueries({
          queryKey: ["configuration"],
        });
        notifySuccess("Configuration saved!");
      },
      onError: async (data: Error) => {
        notifyError("Could not save the configuration", data.message);
      },
    }
  );

  const onFormSubmit = handleSubmit(async (conf) => {
    const client = new AlgoliaSearchProvider({
      appId: conf.appId ?? "",
      apiKey: conf.secretKey ?? "",
      indexNamePrefix: conf.indexNamePrefix,
    });

    try {
      await client.ping();
      setCredentialsValidationError(false);

      mutate(conf);
    } catch (e) {
      trigger();
      setCredentialsValidationError(true);
    }
  });

  const isFormDisabled = isMutationLoading || isQueryLoading;

  return (
    <Box>
      <form onSubmit={onFormSubmit}>
        <Box padding={8}>
          <Box marginBottom={8}>
            <Controller
              name="appId"
              control={control}
              render={({ field, fieldState }) => {
                return (
                  <Input
                    disabled={isFormDisabled}
                    required
                    label="Application ID"
                    error={fieldState.invalid}
                    helperText={
                      fieldState.error?.message ?? "Usually 10 characters, e.g. XYZAAABB00"
                    }
                    {...field}
                  />
                );
              }}
            />
          </Box>
          <Box marginBottom={8} key={"secret"} /* todo why is this "key" here? */>
            <Controller
              name="secretKey"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  helperText={
                    fieldState.error?.message ?? "In Algolia dashboard it's a masked field"
                  }
                  disabled={isFormDisabled}
                  required
                  label="Admin API Key"
                  error={fieldState.invalid}
                  {...field}
                />
              )}
            />
          </Box>

          <Controller
            name="indexNamePrefix"
            control={control}
            render={({ field, fieldState }) => {
              return (
                <Input
                  disabled={isFormDisabled}
                  error={fieldState.invalid}
                  label="Index name prefix"
                  helperText={
                    fieldState.error?.message ??
                    'Optional prefix, you can add "test" or "staging" to test the app'
                  }
                  {...field}
                />
              );
            }}
          />

          {credentialsValidationError && (
            <Box marginTop={8}>
              <Text color={"textCriticalDefault"}>
                Could not connect to Algolia. Please verify your credentials
              </Text>
            </Box>
          )}
        </Box>

        <Divider margin={0} marginTop={8} />

        <Box paddingX={8} paddingY={6} display={"flex"} justifyContent={"flex-end"}>
          <Button disabled={isFormDisabled} type="submit" variant="primary">
            {isFormDisabled ? "Loading..." : "Save"}
          </Button>
        </Box>
      </form>
    </Box>
  );
};
