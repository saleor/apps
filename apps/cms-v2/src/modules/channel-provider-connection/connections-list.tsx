import { Box, Button, Text } from "@saleor/macaw-ui/next";
import React from "react";
import { createProvider } from "../shared/cms-provider";
import { trpcClient } from "../trpc/trpc-client";
import { ChanelProviderConnectionsSectionHeader } from "./channel-provider-connections-section-header";

export const ConnectionsList = (props: { onRemove(connId: string): void }) => {
  const { data } = trpcClient.channelsProvidersConnection.fetchConnections.useQuery();
  const { data: channels } = trpcClient.channelsProvidersConnection.fetchAllChannels.useQuery();
  const { data: providers } = trpcClient.providersConfigs.getAll.useQuery();

  if (!data || !providers) {
    return null;
  }

  return (
    <Box>
      <ChanelProviderConnectionsSectionHeader />
      <Box
        display="grid"
        justifyContent={"space-between"}
        __gridTemplateColumns={"1fr 1fr auto"}
        gap={4}
        alignItems="center"
      >
        <Text variant="caption">Saleor Channel</Text>
        <Text variant="caption">Target CMS</Text>
        <div />
        {data?.map((conn) => {
          const provider = providers.find((p) => p.id === conn.providerId);

          if (!provider) {
            throw new Error("Provider not found");
          }

          const providerName = createProvider(provider.type).displayName;

          return (
            <React.Fragment key={conn.id}>
              <Text>{channels?.find((c) => c.slug === conn.channelSlug)?.name}</Text>
              <Text>
                <Text>{provider.configName}</Text>
                <Text color="textNeutralSubdued"> ({providerName})</Text>
              </Text>
              <Button onClick={() => props.onRemove(conn.id)} variant="tertiary">
                Remove
              </Button>
            </React.Fragment>
          );
        })}
      </Box>
    </Box>
  );
};
