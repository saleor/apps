import { BulkSyncView } from "@/modules/bulk-sync/bulk-sync-view";
import { trpcClient } from "@/modules/trpc/trpc-client";
import { SkeletonLayout } from "@saleor/apps-ui";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { z } from "zod";

const BulkSyncPage: NextPage = () => {
  const { query } = useRouter();
  const id = query["connection-id"] as string | undefined;
  const { push } = useRouter();

  const parsedID = z.string().optional().parse(id);

  const {
    data: connection,
    isLoading: connectionLoading,
    isSuccess: connectionFetched,
  } = trpcClient.channelsProvidersConnection.fetchConnection.useQuery(
    {
      id: parsedID ?? "",
    },
    {
      enabled: !!parsedID,
    },
  );

  const {
    data: provider,
    isLoading: providerLoading,
    isSuccess: providerFetched,
  } = trpcClient.providersConfigs.getOne.useQuery(
    {
      id: connection?.providerId ?? "",
    },
    {
      enabled: !!connection,
    },
  );

  if ((providerFetched && !provider) || (connectionFetched && !connection)) {
    push("/404");
    return null;
  }

  if (connectionLoading || providerLoading) {
    return <SkeletonLayout.Section />;
  }

  if (!(provider && connection)) {
    return null;
  }

  return <BulkSyncView configuration={provider} connection={connection} />;
};

export default BulkSyncPage;
