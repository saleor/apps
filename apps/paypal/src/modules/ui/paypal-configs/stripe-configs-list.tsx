import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { ConfigsList } from "@saleor/apps-ui";
import { Chip, Text } from "@saleor/macaw-ui";
import { useRouter } from "next/router";

import {
  PayPalFrontendConfig,
  PayPalFrontendConfigSerializedFields,
} from "@/modules/app-config/domain/paypal-config";
import { trpcClient } from "@/modules/trpc/trpc-client";

type Props = {
  configs: Array<PayPalFrontendConfigSerializedFields>;
};

const webhookDisabled = <Text color="warning1">Webhook disabled, app will not work properly</Text>;
const webhookMissing = <Text color="critical1">Webhook missing, create config again</Text>;

const testEnvChip = (
  <Chip marginLeft="auto" __backgroundColor="#CC4B00" borderColor="transparent" size="large">
    <Text __color={"#FFF"} size={1} whiteSpace="nowrap">
      PayPal test mode
    </Text>
  </Chip>
);
const liveEnvChip = (
  <Chip marginLeft={"auto"} size="large" whiteSpace="nowrap">
    <Text size={1}>PayPal live mode</Text>
  </Chip>
);

export const PayPalConfigsList = ({ configs }: Props) => {
  const router = useRouter();
  const { notifyError, notifySuccess } = useDashboardNotification();
  const configsList = trpcClient.appConfig.getPayPalConfigsList.useQuery();
  const mappings = trpcClient.appConfig.channelsConfigsMapping.useQuery();
  const { mutate: removePayPalConfig, isLoading } =
    trpcClient.appConfig.removePayPalConfig.useMutation({
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
    });

  return (
    <ConfigsList
      onConfigDelete={(id) => {
        removePayPalConfig({
          configId: id,
        });
      }}
      configs={configs.map((config) => {
        const configInstance = PayPalFrontendConfig.createFromSerializedFields(config);
        const envValue = configInstance.getPayPalEnvValue();

        return {
          id: configInstance.id,
          name: configInstance.name,
          deleteButtonSlotLeft() {
            return envValue === "SANDBOX" ? testEnvChip : liveEnvChip;
          },
        };
      })}
      onNewConfigAdd={() => {
        router.push("/config/new");
      }}
      isLoading={isLoading}
    />
  );
};
