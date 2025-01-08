import { Layout, SemanticChip, SkeletonLayout } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui";

import { trpcClient } from "@/modules/trpc/trpc-client";

export const WebhookStatus = () => {
  const { data: config, isLoading, refetch } = trpcClient.configuration.getWebhookConfig.useQuery();

  console.log(config);

  if (isLoading || !config) {
    return <SkeletonLayout.Section />;
  }

  return (
    <Layout.AppSectionCard>
      <Box display={"flex"} gap={4} alignItems={"center"} justifyContent={"space-between"}>
        {config.areWebhooksActive ? (
          <>
            <Text size={2} color="default2">
              Webhooks are active. For more information about webhooks check Manage app button in
              header above.
            </Text>
            <SemanticChip marginLeft={"auto"} size="small" variant={"success"}>
              ACTIVE
            </SemanticChip>
          </>
        ) : (
          <>
            <Text size={2} color="default2">
              Your webhooks were disabled. Most likely, your configuration is invalid. Check your
              credentials.
            </Text>
            <SemanticChip marginLeft={"auto"} size="small" variant={"error"}>
              DISABLED
            </SemanticChip>
          </>
        )}
      </Box>
    </Layout.AppSectionCard>
  );
};
