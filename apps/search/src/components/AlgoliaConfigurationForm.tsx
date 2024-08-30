import { zodResolver } from "@hookform/resolvers/zod";
import { useDashboardNotification } from "@saleor/apps-shared";
import { Layout } from "@saleor/apps-ui";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { Input } from "@saleor/react-hook-form-macaw";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { algoliaCredentialsVerifier } from "../lib/algolia/algolia-credentials-verifier";
import {
  AppConfigurationFields,
  AppConfigurationSchema,
} from "../modules/configuration/configuration";
import { trpcClient } from "../modules/trpc/trpc-client";

export const AlgoliaConfigurationForm = () => {
  const { notifyError, notifySuccess } = useDashboardNotification();

  const [credentialsValidationError, setCredentialsValidationError] = useState(false);

  const { handleSubmit, trigger, setValue, control } = useForm<AppConfigurationFields>({
    defaultValues: { appId: "", indexNamePrefix: "", secretKey: "" },
    // @ts-ignore - todo - some strange TS error happens here
    resolver: zodResolver(AppConfigurationSchema),
  });

  const reactQueryClient = useQueryClient();

  const { isLoading: isQueryLoading, refetch: refetchConfig } =
    trpcClient.configuration.getConfig.useQuery(undefined, {
      onSuccess(data) {
        setValue("secretKey", data?.appConfig?.secretKey || "");
        setValue("appId", data?.appConfig?.appId || "");
        setValue("indexNamePrefix", data?.appConfig?.indexNamePrefix || "");
      },
    });

  const { mutate: setConfig, isLoading: isMutationLoading } =
    trpcClient.configuration.setConnectionConfig.useMutation({
      onSuccess: async () => {
        await Promise.all([
          refetchConfig(),
          // todo migrate to trpc
          reactQueryClient.refetchQueries({
            queryKey: ["webhooks-status"],
          }),
        ]);
        notifySuccess("Configuration saved!");
      },
      onError: async (error) => {
        notifyError("Could not save the configuration", error.message);
      },
    });

  const onFormSubmit = handleSubmit(async (conf) => {
    try {
      await algoliaCredentialsVerifier.verifyCredentials({
        appId: conf.appId,
        apiKey: conf.secretKey,
      });

      setCredentialsValidationError(false);

      setConfig(conf);
    } catch (e) {
      trigger();
      setCredentialsValidationError(true);
    }
  });

  const isFormDisabled = isMutationLoading || isQueryLoading;

  return (
    <Layout.AppSectionCard
      as="form"
      onSubmit={onFormSubmit}
      footer={
        <Box display={"flex"} justifyContent={"flex-end"}>
          <Button disabled={isFormDisabled} type="submit" variant="primary">
            {isFormDisabled ? "Loading..." : "Save"}
          </Button>
        </Box>
      }
    >
      <Box>
        <Input
          control={control}
          name="appId"
          disabled={isFormDisabled}
          required
          label="Application ID"
          helperText="Usually 10 characters, e.g. XYZAAABB00"
        />
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
            <Text color={"critical1"}>
              Could not connect to Algolia. Please verify your credentials
            </Text>
          </Box>
        )}
      </Box>
    </Layout.AppSectionCard>
  );
};
