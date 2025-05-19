import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { Layout } from "@saleor/apps-ui";
import { Box, Button, Chip, Modal, Text, TrashBinIcon } from "@saleor/macaw-ui";
import { useRouter } from "next/router";
import { useState } from "react";

import {
  StripeFrontendConfig,
  StripeFrontendConfigSerializedFields,
} from "@/modules/app-config/domain/stripe-config";
import { trpcClient } from "@/modules/trpc/trpc-client";

import { DeleteConfigurationModalContent } from "./delete-configuration-modal-content";

type Props = {
  configs: Array<StripeFrontendConfigSerializedFields>;
};

const webhookDisabled = <Text color="warning1">Webhook disabled, app will not work properly</Text>;
const webhookMissing = <Text color="critical1">Webhook missing, create config again</Text>;

export const StripeConfigsList = ({ configs, ...props }: Props) => {
  const router = useRouter();
  const { notifyError, notifySuccess } = useDashboardNotification();
  const configsList = trpcClient.appConfig.getStripeConfigsList.useQuery();
  const mappings = trpcClient.appConfig.channelsConfigsMapping.useQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { mutate, isLoading } = trpcClient.appConfig.removeStripeConfig.useMutation({
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
    <Layout.AppSectionCard
      footer={
        <Box display="flex" justifyContent="flex-end">
          <Button onClick={() => router.push("/config/new")}>Add Stripe configuration</Button>
        </Box>
      }
    >
      <Box {...props}>
        {configs.map((config) => {
          const configInstance = StripeFrontendConfig.createFromSerializedFields(config);
          const envValue = configInstance.getStripeEnvValue();

          const testEnvChip = (
            <Chip
              marginLeft="auto"
              __backgroundColor="#CC4B00"
              borderColor="transparent"
              size="large"
            >
              <Text __color={"#FFF"} size={1}>
                Stripe test mode
              </Text>
            </Chip>
          );
          const liveEnvChip = (
            <Chip marginLeft={"auto"} size="large">
              <Text size={1}>Stripe live mode</Text>
            </Chip>
          );

          const webhookStatusInfo =
            configInstance.webhookStatus === "disabled"
              ? webhookDisabled
              : configInstance.webhookStatus === "missing"
              ? webhookMissing
              : null;

          return (
            <Modal open={isModalOpen} onChange={setIsModalOpen}>
              <DeleteConfigurationModalContent
                onDeleteClick={() => {
                  mutate({ configId: configInstance.id });
                  setIsModalOpen(false);
                }}
              />
              <Box padding={4} key={configInstance.id}>
                <Box
                  display={"flex"}
                  justifyContent="space-between"
                  width={"100%"}
                  alignItems={"center"}
                >
                  <Text marginRight={4} display="block">
                    {configInstance.name}
                  </Text>
                  {envValue === "TEST" ? testEnvChip : liveEnvChip}
                  <Modal.Trigger>
                    <Button
                      disabled={isLoading}
                      marginLeft={4}
                      display="block"
                      icon={<TrashBinIcon />}
                      variant="secondary"
                    />
                  </Modal.Trigger>
                </Box>
                {webhookStatusInfo}
              </Box>
            </Modal>
          );
        })}
      </Box>
    </Layout.AppSectionCard>
  );
};
