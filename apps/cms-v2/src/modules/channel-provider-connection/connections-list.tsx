import { SkeletonLayout } from "@saleor/apps-ui";
import { Box, Button, Text } from "@saleor/macaw-ui";
import React from "react";

import { ProvidersResolver } from "../providers/providers-resolver";
import { trpcClient } from "../trpc/trpc-client";
import { ChanelProviderConnectionsSectionHeader } from "./channel-provider-connections-section-header";

export const ConnectionsList = (props: { onRemove(connectionId: string): void }) => {
  const { data } = trpcClient.channelsProvidersConnection.fetchConnections.useQuery();
  const { data: channels } = trpcClient.channelsProvidersConnection.fetchAllChannels.useQuery();
  const { data: providers } = trpcClient.providersConfigs.getAll.useQuery();

  if (!data || !providers) {
    return <SkeletonLayout.Section />;
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
        <Text size={2}>Saleor Channel</Text>
        <Text size={2}>Target CMS</Text>
        <div />
        {data?.map((conn) => {
          const provider = providers.find((p) => p.id === conn.providerId);

          if (!provider) {
            throw new Error("Provider not found");
          }

          const providerName = ProvidersResolver.createProviderMeta(provider.type).displayName;

          return (
            <React.Fragment key={conn.id}>
              <Text>{channels?.find((c) => c.slug === conn.channelSlug)?.name}</Text>
              <Text>
                <Text>{provider.configName}</Text>
                <Text color="default2"> ({providerName})</Text>
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
