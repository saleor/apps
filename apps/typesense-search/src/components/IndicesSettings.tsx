import { Box, Button, Text } from "@saleor/macaw-ui";
import React from "react";
import { Layout } from "@saleor/apps-ui";
import { useIndicesSetupMutation } from "../lib/useIndicesSetup";
import { trpcClient } from "../modules/trpc/trpc-client";

export const IndicesSettings = () => {
  const { data: typesenseConfiguration } = trpcClient.configuration.getConfig.useQuery();
  const updateWebhooksMutation = useIndicesSetupMutation();

  const isConfigured =
    !!typesenseConfiguration?.appConfig?.host &&
    !!typesenseConfiguration.appConfig?.apiKey &&
    !!typesenseConfiguration.appConfig?.protocol &&
    !!typesenseConfiguration.appConfig?.port &&
    !!typesenseConfiguration.appConfig?.connectionTimeoutSeconds;

  return (
    <Layout.AppSectionCard
      footer={
        <Box display={"flex"} justifyContent={"flex-end"}>
          <Button
            disabled={!isConfigured}
            onClick={() => updateWebhooksMutation.mutate()}
            variant="primary"
          >
            Select default indices
          </Button>
        </Box>
      }
    >
      <Box>
        <Text variant={"heading"} as={"p"} marginBottom={1.5}>
          Please note - if indices are already configured, this operation will overwrite settings
          mentioned above.
        </Text>
      </Box>
    </Layout.AppSectionCard>
  );
};
