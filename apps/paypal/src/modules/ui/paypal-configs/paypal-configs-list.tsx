import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { Chip, Text } from "@saleor/macaw-ui";

import {
  PayPalFrontendConfig,
  PayPalFrontendConfigSerializedFields,
} from "@/modules/app-config/domain/paypal-config";
import { trpcClient } from "@/modules/trpc/trpc-client";

import { CustomConfigsList } from "./custom-configs-list";

type Props = {
  configs: Array<PayPalFrontendConfigSerializedFields>;
};

const webhookDisabled = <Text color="warning1">Webhook disabled, app will not work properly</Text>;
const webhookMissing = <Text color="critical1">Webhook missing, create config again</Text>;

const testEnvChip = (
  <Chip
    marginLeft="auto"
    __backgroundColor="#FEF3C7"
    borderColor="warning1"
    borderWidth={1}
    size="large"
  >
    <Text __color="#92400E" size={2} whiteSpace="nowrap" fontWeight="medium">
      🧪 Test Mode
    </Text>
  </Chip>
);
const liveEnvChip = (
  <Chip
    marginLeft={"auto"}
    __backgroundColor="#D1FAE5"
    borderColor="success1"
    borderWidth={1}
    size="large"
    whiteSpace="nowrap"
  >
    <Text __color="#065F46" size={2} fontWeight="medium">
      ✓ Live Mode
    </Text>
  </Chip>
);

export const PayPalConfigsList = ({ configs }: Props) => {
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
    <CustomConfigsList
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
      isLoading={isLoading}
    />
  );
};
