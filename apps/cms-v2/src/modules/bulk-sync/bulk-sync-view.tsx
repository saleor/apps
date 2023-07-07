import { Box, Text, WarningIcon } from "@saleor/macaw-ui/next";
import { trpcClient } from "../trpc/trpc-client";

export const BulkSyncView = (props: { connectionId: string }) => {
  const { data: connection } = trpcClient.channelsProvidersConnection.fetchConnection.useQuery({
    id: props.connectionId,
  });

  const { data: provider } = trpcClient.providersList.fetchConfiguration.useQuery(
    {
      id: connection?.providerId ?? "",
    },
    {
      enabled: !!connection,
    }
  );

  return (
    <Box>
      <Text marginBottom={4} as="h1" variant="hero">
        Products bulk synchronization
      </Text>

      <Box display="flex" alignItems="center" gap={2}>
        <WarningIcon />
        <Text size="large">Do not close this page</Text>
      </Box>

      {provider && <Box>asd</Box>}
    </Box>
  );
};

// todo add zod resolvers to every form
