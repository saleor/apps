import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { ConfigsList } from "@saleor/apps-ui";
import { useRouter } from "next/router";

import { AppChannelConfigFields } from "@/modules/app-config/app-config";
import { trpcClient } from "@/modules/trpc/trpc-client";

type Props = {
  configs: Array<AppChannelConfigFields>;
};

export const AtobaraiConfigsList = ({ configs }: Props) => {
  const router = useRouter();
  const { notifyError, notifySuccess } = useDashboardNotification();
  const configsList = trpcClient.appConfig.getConfigsList.useQuery();
  const mappings = trpcClient.appConfig.channelsConfigsMapping.useQuery();
  const { mutate: removeAtobaraiConfig, isLoading } = trpcClient.appConfig.removeConfig.useMutation(
    {
      onSuccess() {
        notifySuccess("Configuration deleted");
      },
      onError(err) {
        notifyError("Error deleting config", err.message);
      },
      onSettled() {
        mappings.refetch();
        configsList.refetch();
      },
    },
  );

  return (
    <ConfigsList
      configs={configs}
      onNewConfigAdd={() => router.push("/config/new")}
      isLoading={isLoading}
      onConfigDelete={(id) => removeAtobaraiConfig({ configId: id })}
    />
  );
};
