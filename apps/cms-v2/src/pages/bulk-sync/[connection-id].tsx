import { BulkSyncView } from "@/modules/bulk-sync/bulk-sync-view";
import { trpcClient } from "@/modules/trpc/trpc-client";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { z } from "zod";
import { Text } from "@saleor/macaw-ui/next";

const BulkSyncPage: NextPage = () => {
  const { query } = useRouter();
  const id = query["connection-id"] as string | undefined;

  const parsedID = z.string().optional().parse(id);

  const { data: connection, isLoading: connectionLoading } =
    trpcClient.channelsProvidersConnection.fetchConnection.useQuery(
      {
        id: parsedID ?? "",
      },
      {
        enabled: !!parsedID,
      }
    );

  const { data: provider, isLoading: providerLoading } =
    trpcClient.providersList.fetchConfiguration.useQuery(
      {
        id: connection?.providerId ?? "",
      },
      {
        enabled: !!connection,
      }
    );

  if (connectionLoading || providerLoading) {
    return <Text>Loading</Text>;
  }

  if (!id ?? !provider ?? !connection) {
    // todo redirect if not found / wrong url
    return null;
  }

  return <BulkSyncView configuration={provider} connection={connection} />;
};

export default BulkSyncPage;
