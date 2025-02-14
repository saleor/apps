import { zodResolver } from "@hookform/resolvers/zod";
import { ButtonsBox, Layout, SkeletonLayout } from "@saleor/apps-ui";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { Select } from "@saleor/react-hook-form-macaw";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ProvidersResolver } from "../providers/providers-resolver";
import { trpcClient } from "../trpc/trpc-client";

const FormSchema = z.object({
  connectionId: z.string().min(7),
});

const EmptyState = () => (
  <Layout.AppSectionCard>
    <Box display="flex" flexDirection={"column"} gap={4} justifyContent={"center"}>
      <Text size={5} fontWeight="bold">
        Bulk products synchronization
      </Text>
      <Text>Create a channel connection above to enable bulk synchronization.</Text>
    </Box>
  </Layout.AppSectionCard>
);

export const BulkSyncSection = () => {
  const { push } = useRouter();

  const { data: connections } = trpcClient.channelsProvidersConnection.fetchConnections.useQuery();
  const { data: providers } = trpcClient.providersConfigs.getAll.useQuery();

  const { control, handleSubmit } = useForm({
    defaultValues: {
      connectionId: "",
    },
    resolver: zodResolver(FormSchema),
  });

  if (!connections || !providers) {
    return <SkeletonLayout.Section />;
  }

  if (connections.length === 0) {
    return <EmptyState />;
  }

  return (
    <Layout.AppSectionCard>
      <Text as="h2" marginBottom={6} size={5} fontWeight="bold">
        Bulk products synchronization
      </Text>
      <Text as="p">
        Choose a connection and start synchronization. Process is running in the browser.
      </Text>
      <Text as="p" size={4} fontWeight="bold">
        Do not close the app until it is finished
      </Text>
      <Box
        display="grid"
        gap={4}
        marginTop={4}
        as="form"
        onSubmit={handleSubmit((values) => {
          push(`/bulk-sync/${values.connectionId}`);
        })}
      >
        <Select
          required
          control={control}
          name="connectionId"
          label="Connection"
          options={connections.map((c) => {
            const provider = providers.find((p) => p.id === c.providerId)!;
            const providerDisplay = ProvidersResolver.createProviderMeta(provider.type);

            return {
              label: `${c.channelSlug} -> ${provider?.configName} (${providerDisplay.displayName})`,
              value: c.id,
            };
          })}
        />
        <ButtonsBox>
          <Button type="submit">Start sync</Button>
        </ButtonsBox>
      </Box>
    </Layout.AppSectionCard>
  );
};
