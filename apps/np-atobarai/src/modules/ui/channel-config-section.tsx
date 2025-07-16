import { Layout } from "@saleor/apps-ui";
import { Skeleton, Text } from "@saleor/macaw-ui";
import { useEffect } from "react";

import { trpcClient } from "@/modules/trpc/trpc-client";
import { ConfigsList } from "@/modules/ui/configs-list";
import { EmptyConfigs } from "@/modules/ui/empty-configs";

export const ChannelConfigSection = () => {
  const { data, error, refetch } = trpcClient.appConfig.getConfigsList.useQuery();

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
    return <ConfigsList configs={data} />;
  }

  return (
    <Layout.AppSectionCard footer={<Skeleton />}>
      <Skeleton />
    </Layout.AppSectionCard>
  );
};
