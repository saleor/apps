import { Layout } from "@saleor/apps-ui";
import { Box, Skeleton, Text } from "@saleor/macaw-ui";
import { useEffect } from "react";

import { trpcClient } from "@/modules/trpc/trpc-client";
import { PayPalConfigsList } from "@/modules/ui/paypal-configs/paypal-configs-list";

export const ChannelConfigSection = () => {
  const { data, error, refetch } = trpcClient.appConfig.getPayPalConfigsList.useQuery();

  useEffect(() => {
    void refetch();
  }, []);

  if (error) {
    return <Text color="critical1">Error fetching config: {error.message}</Text>;
  }

  if (data && data.length === 0) {
    return (
      <Box padding={6} display="flex" alignItems="center" justifyContent="center">
        <Text size={3} color="default2">
          No PayPal configurations found. Configurations are managed by WSM administrators.
        </Text>
      </Box>
    );
  }

  if (data && data.length > 0) {
    return <PayPalConfigsList configs={data} />;
  }

  return (
    <Layout.AppSectionCard footer={<Skeleton />}>
      <Skeleton />
    </Layout.AppSectionCard>
  );
};
