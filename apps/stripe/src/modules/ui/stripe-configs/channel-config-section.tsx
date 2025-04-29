import { Box, Text } from "@saleor/macaw-ui";
import { useEffect } from "react";

import { trpcClient } from "@/modules/trpc/trpc-client";
import { EmptyConfigs } from "@/modules/ui/stripe-configs/empty-configs";
import { StripeConfigsList } from "@/modules/ui/stripe-configs/stripe-configs-list";

export const ChannelConfigSection = () => {
  const { data, error, refetch } = trpcClient.appConfig.getStripeConfigsList.useQuery();

  useEffect(() => {
    refetch();
  }, []);

  if (error) {
    return <Text color="critical1">Error fetching config: {error.message}</Text>;
  }

  if (data && data.length === 0) {
    return <EmptyConfigs />;
  }

  if (data && data.length > 0) {
    return <StripeConfigsList configs={data} />;
  }

  return <Box>Loading...</Box>;
};
