import { Box, Text } from "@saleor/macaw-ui";
import { useEffect } from "react";

import { trpcClient } from "@/modules/trpc/trpc-client";
import { ChannelsConfigMapping } from "@/modules/ui/channel-configs/channels-config-mapping";

export const ChannelConfigMappingSection = () => {
  const {
    data: channelsData,
    error: channelsError,
    refetch: refetchChannels,
  } = trpcClient.appConfig.fetchChannels.useQuery();
  const {
    data: configsData,
    error: configsError,
    refetch: refetchConfig,
  } = trpcClient.appConfig.getStripeConfigsList.useQuery();

  useEffect(() => {
    refetchChannels();
    refetchConfig();
  }, []);

  const errors = [channelsError, configsError].filter(Boolean);

  if (errors && errors.length > 0) {
    // todo better ui

    return <Text>Error fetching config: {errors[0].message}</Text>;
  }

  if (channelsData && channelsData.length === 0) {
    return <Text>No channels found. You must have at least one channel</Text>;
  }

  if (configsData && configsData.length === 0) {
    return <Text>No configs found. Create at least one configuration first</Text>;
  }

  if (configsData && channelsData && configsData.length > 0 && channelsData.length > 0) {
    return <ChannelsConfigMapping channels={channelsData} configs={configsData} />;
  }

  return <Box>Loading...</Box>;
};
