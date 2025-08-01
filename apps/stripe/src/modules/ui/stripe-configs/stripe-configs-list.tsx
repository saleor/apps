import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { ConfigsList } from "@saleor/apps-ui";
import { Box, Button, Chip, Text } from "@saleor/macaw-ui";
import { useRouter } from "next/router";

import {
  StripeFrontendConfig,
  StripeFrontendConfigSerializedFields,
} from "@/modules/app-config/domain/stripe-config";
import { trpcClient } from "@/modules/trpc/trpc-client";

type Props = {
  configs: Array<StripeFrontendConfigSerializedFields>;
  onConnect(configId: string): void;
};

const webhookDisabled = <Text color="warning1">Webhook disabled, app will not work properly</Text>;
const webhookMissing = <Text color="critical1">Webhook missing, create config again</Text>;

const testEnvChip = (
  <Chip marginLeft="auto" __backgroundColor="#CC4B00" borderColor="transparent" size="large">
    <Text __color={"#FFF"} size={1} whiteSpace="nowrap">
      Stripe test mode
    </Text>
  </Chip>
);
const liveEnvChip = (
  <Chip marginLeft={"auto"} size="large" whiteSpace="nowrap">
    <Text size={1}>Stripe live mode</Text>
  </Chip>
);

export const StripeConfigsList = ({ configs, onConnect }: Props) => {
  const router = useRouter();
  const { notifyError, notifySuccess } = useDashboardNotification();
  const configsList = trpcClient.appConfig.getStripeConfigsList.useQuery();
  const mappings = trpcClient.appConfig.channelsConfigsMapping.useQuery();
  const { mutate: removeStripeConfig, isLoading } =
    trpcClient.appConfig.removeStripeConfig.useMutation({
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
        removeStripeConfig({
          configId: id,
        });
      }}
      configs={configs.map((config) => {
        const configInstance = StripeFrontendConfig.createFromSerializedFields(config);
        const envValue = configInstance.getStripeEnvValue();

        const webhookStatusInfo =
          configInstance.webhookStatus === "disabled"
            ? webhookDisabled
            : configInstance.webhookStatus === "missing"
            ? webhookMissing
            : null;

        return {
          id: configInstance.id,
          name: configInstance.name,
          deleteButtonSlotLeft() {
            const chip = envValue === "TEST" ? testEnvChip : liveEnvChip;

            return (
              <Box display="flex" alignItems="center" gap={2}>
                <Button onClick={() => onConnect(config.id)} size={"small"} variant="secondary">
                  Connect
                </Button>
                {chip}
              </Box>
            );
          },
          deleteButtonSlotRight() {
            return webhookStatusInfo;
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
