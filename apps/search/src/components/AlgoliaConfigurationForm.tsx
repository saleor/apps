import { useAuthenticatedFetch } from "@saleor/app-sdk/app-bridge";

import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchConfiguration } from "../lib/configuration";
import { Box, Button, Divider, Text } from "@saleor/macaw-ui/next";
import { Input } from "@saleor/react-hook-form-macaw";
import { useDashboardNotification } from "@saleor/apps-shared";
import { AlgoliaSearchProvider } from "../lib/algolia/algoliaSearchProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { AppConfigurationFields, AppConfigurationSchema } from "../domain/configuration";

export const AlgoliaConfigurationForm = () => {
  const { notifyError, notifySuccess } = useDashboardNotification();
  const fetch = useAuthenticatedFetch();

  const [credentialsValidationError, setCredentialsValidationError] = useState(false);

  const { handleSubmit, trigger, setValue, control } = useForm<AppConfigurationFields>({
    defaultValues: { appId: "", indexNamePrefix: "", secretKey: "" },
    // @ts-ignore - todo - some strange TS error happens here
    resolver: zodResolver(AppConfigurationSchema),
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
    async (conf: AppConfigurationFields) => {
      const resp = await fetch("/api/configuration", {
        method: "POST",
        body: JSON.stringify(conf),
      });

      if (resp.status >= 200 && resp.status < 300) {
        const data = (await resp.json()) as { data?: AppConfigurationFields };

        return data.data;
      }
      throw new Error(`Server responded with status code ${resp.status}`);
    },
    {
      onSuccess: async () => {
        await Promise.all([
          reactQueryClient.refetchQueries({
            queryKey: ["configuration"],
          }),
          reactQueryClient.refetchQueries({
            queryKey: ["webhooks-status"],
          }),
        ]);
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
        <Box padding={5}>
          <Box marginBottom={5}>
            <Input
              control={control}
              name="appId"
              disabled={isFormDisabled}
              required
              label="Application ID"
              helperText="Usually 10 characters, e.g. XYZAAABB00"
            />
          </Box>
          <Box marginBottom={5} key={"secret"} /* todo why is this "key" here? */>
            <Input
              control={control}
              name="secretKey"
              disabled={isFormDisabled}
              required
              label="Admin API Key"
              helperText="In Algolia dashboard it's a masked field"
            />
          </Box>

          <Input
            control={control}
            name="indexNamePrefix"
            disabled={isFormDisabled}
            label="Index name prefix"
            helperText='Optional prefix, you can add "test" or "staging" to test the app'
          />

          {credentialsValidationError && (
            <Box marginTop={5}>
              <Text color={"textCriticalDefault"}>
                Could not connect to Algolia. Please verify your credentials
              </Text>
            </Box>
          )}
        </Box>

        <Divider margin={0} marginTop={5} />

        <Box paddingX={5} paddingY={3} display={"flex"} justifyContent={"flex-end"}>
          <Button disabled={isFormDisabled} type="submit" variant="primary">
            {isFormDisabled ? "Loading..." : "Save"}
          </Button>
        </Box>
      </form>
    </Box>
  );
};
