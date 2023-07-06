import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { trpcClient } from "../trpc/trpc-client";

const Header = () => (
  <Text marginBottom={2} as="h2" variant="heading">
    Channels Connections
  </Text>
);

const NoConnections = () => (
  <Box>
    <Header />
    <Text marginBottom={4} as="p">
      No channels connected yet
    </Text>
    <Box display="flex" justifyContent="flex-end">
      <Button>Create first connection</Button>
    </Box>
  </Box>
);

export const ChannelProviderConnectionList = () => {
  const { data } = trpcClient.channelsProvidersConnection.fetchConnections.useQuery();

  console.log(data);

  if (!data) {
    return null;
  }

  if (data.length === 0) {
    return <NoConnections />;
  }
};
