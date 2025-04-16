import { Box } from "@saleor/macaw-ui";

import { trpcClient } from "@/modules/trpc/trpc-client";
import { EmptyConfigs } from "@/modules/ui/stripe-configs/empty-configs";

export const ChannelConfigSection = () => {
  // todo call trpc for root configs

  const { data, error } = trpcClient.appConfig.getStripeConfigsList.useQuery();

  console.log(data);
  console.log(error);

  if (data && data.length === 0) {
    return <EmptyConfigs />;
  }

  return <Box>Loading...</Box>;
};
