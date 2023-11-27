import { Box, Button, Text } from "@saleor/macaw-ui";
import React from "react";

import { trpcClient } from "../trpc/trpc-client";
import { ChanelProviderConnectionsSectionHeader } from "./channel-provider-connections-section-header";
import { ProvidersResolver } from "../providers/providers-resolver";
import { SkeletonLayout } from "@saleor/apps-ui";

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
        <Text variant="caption">Saleor Channel</Text>
        <Text variant="caption">Target CMS</Text>
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
