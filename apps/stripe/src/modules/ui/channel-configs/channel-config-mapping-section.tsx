import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { Box, Text } from "@saleor/macaw-ui";
import { useEffect } from "react";

import { trpcClient } from "@/modules/trpc/trpc-client";
import { ChannelsConfigMapping } from "@/modules/ui/channel-configs/channels-config-mapping";

export const ChannelConfigMappingSection = () => {
  const allChannels = trpcClient.appConfig.fetchChannels.useQuery();
  const allConfigs = trpcClient.appConfig.getStripeConfigsList.useQuery();
  const allMappings = trpcClient.appConfig.channelsConfigsMapping.useQuery();
  const allResults = [allChannels, allConfigs, allMappings];

  const { notifyError, notifySuccess } = useDashboardNotification();

  const mappingUpdate = trpcClient.appConfig.updateMapping.useMutation({
    onSuccess() {
      notifySuccess("Mapping updated");

      return allMappings.refetch();
    },
    onError() {
      notifyError("Error updating mapping", mappingUpdate.error?.message ?? "Unknown error");
    },
  });

  useEffect(() => {
    allResults.forEach((query) => query.refetch());
  }, []);

  const errors = allResults.map((r) => r.error).filter(Boolean);
  const anythingLoading = allResults.map((r) => r.isLoading).some(Boolean);

  if (errors && errors.length > 0) {
    // todo better ui

    return <Text>Error fetching config: {errors[0].message}</Text>;
  }

  const channelsExist = allChannels.data && allChannels.data.length > 0;
  const configsExist = allConfigs.data && allConfigs.data.length > 0;
  const mappingExist = allMappings.data;

  if (anythingLoading) {
    return <Box>Loading...</Box>;
  }

  if (!channelsExist) {
    return <Text>No channels found. You must have at least one channel</Text>;
  }

  if (!configsExist) {
    return <Text>No configs found. Create at least one configuration first</Text>;
  }

  if (configsExist && channelsExist && mappingExist) {
    return (
      <ChannelsConfigMapping
        isLoading={mappingUpdate.isLoading}
        channels={allChannels.data}
        configs={allConfigs.data}
        mapping={allMappings.data}
        onMappingChange={({ configId, channelId }) => {
          mappingUpdate.mutate({
            configId,
            channelId,
          });
        }}
      />
    );
  }

  return null;
};
