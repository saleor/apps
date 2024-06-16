import { zodResolver } from "@hookform/resolvers/zod";
import { useDashboardNotification } from "@saleor/apps-shared";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { Input } from "@saleor/react-hook-form-macaw";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  AppConfigurationFields,
  AppConfigurationSchema,
} from "../modules/configuration/configuration";
import { trpcClient } from "../modules/trpc/trpc-client";
import { Layout } from "@saleor/apps-ui";
import { TypesenseSearchProvider } from "../lib/typesense/typesenseSearchProvider";

export const TypesenseConfigurationForm = () => {
  const { notifyError, notifySuccess } = useDashboardNotification();

  const [credentialsValidationError, setCredentialsValidationError] = useState(false);

  const { handleSubmit, trigger, setValue, control, watch } = useForm<AppConfigurationFields>({
    defaultValues: {
      host: "",
      protocol: "",
      apiKey: "",
      port: 0,
      connectionTimeoutSeconds: 0,
    },
    resolver: zodResolver(AppConfigurationSchema),
  });

  const reactQueryClient = useQueryClient();

  const { isLoading: isQueryLoading, refetch: refetchConfig } =
    trpcClient.configuration.getConfig.useQuery(undefined, {
      onSuccess(data) {
        setValue("host", data?.appConfig?.host ?? "");
        setValue("protocol", data?.appConfig?.protocol ?? "");
        setValue("apiKey", data?.appConfig?.apiKey ?? "");
        setValue("port", data?.appConfig?.port ?? 0);
        setValue("connectionTimeoutSeconds", data?.appConfig?.connectionTimeoutSeconds ?? 0);
      },
    });

  const { mutate: setConfig, isLoading: isMutationLoading } =
    trpcClient.configuration.setConnectionConfig.useMutation({
      onSuccess: async () => {
        await Promise.all([
          refetchConfig(),
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
    const client = new TypesenseSearchProvider({
      host: conf.host,
      apiKey: conf.apiKey,
      protocol: conf.protocol,
      port: conf.port,
      connectionTimeoutSeconds: conf.connectionTimeoutSeconds,
      enabledKeys: [],
    });

    try {
      await client.ping();
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
      <Box display="flex" flexDirection="column" gap={2}>
        <Input
          control={control}
          name="host"
          disabled={isFormDisabled}
          required
          label="Typesense host"
          helperText="For example: localhost"
        />
        <Input
          control={control}
          name="protocol"
          disabled={isFormDisabled}
          required
          label="Protocol"
          helperText="For example: http or https"
        />
        <Input
          control={control}
          name="port"
          disabled={isFormDisabled}
          label="Port"
          helperText="For example: 8108"
          type="number"
          value={watch("port") || ""}
        />
        <Input
          control={control}
          name="apiKey"
          disabled={isFormDisabled}
          label="API Key"
          helperText="For example: xyz"
        />
        <Input
          control={control}
          name="connectionTimeoutSeconds"
          disabled={isFormDisabled}
          label="Connection Timeout Seconds"
          helperText="For example: 2"
          type="number"
          value={watch("connectionTimeoutSeconds") || ""}
        />
        {credentialsValidationError && (
          <Box marginTop={5}>
            <Text color={"textCriticalDefault"}>
              Could not connect to Typesense. Please verify your credentials
            </Text>
          </Box>
        )}
      </Box>
    </Layout.AppSectionCard>
  );
};
