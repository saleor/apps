import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { Layout } from "@saleor/apps-ui";
import { Box, Button, Chip, Modal, Text, TrashBinIcon } from "@saleor/macaw-ui";
import { useRouter } from "next/router";
import { useState } from "react";

import { AppChannelConfig, AppChannelConfigFields } from "@/modules/app-config/app-config";
import { trpcClient } from "@/modules/trpc/trpc-client";

import { DeleteConfigurationModalContent } from "./delete-configuration-modal-content";

type Props = {
  configs: Array<AppChannelConfigFields>;
};

export const ConfigsList = ({ configs, ...props }: Props) => {
  const router = useRouter();
  const { notifyError, notifySuccess } = useDashboardNotification();
  const configsList = trpcClient.appConfig.getConfigsList.useQuery();
  const mappings = trpcClient.appConfig.channelsConfigsMapping.useQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { mutate, isLoading } = trpcClient.appConfig.removeConfig.useMutation({
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
          <Button onClick={() => router.push("/config/new")}>Add configuration</Button>
        </Box>
      }
    >
      <Box {...props}>
        {configs.map((config) => {
          const configInstanceResult = AppChannelConfig.create(config);
          const configInstance = configInstanceResult.unwrapOr(null);

          if (!configInstance) {
            return <div>Error</div>;
          }

          return (
            <Modal open={isModalOpen} onChange={setIsModalOpen} key={config.id}>
              <DeleteConfigurationModalContent
                onDeleteClick={() => {
                  mutate({ configId: configInstance.id });
                  setIsModalOpen(false);
                }}
              />
              <Box paddingY={4} key={configInstance.id}>
                <Box
                  display={"flex"}
                  justifyContent="space-between"
                  width={"100%"}
                  alignItems={"center"}
                >
                  <Text marginRight={4} display="block">
                    {configInstance.name}
                  </Text>
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
              </Box>
            </Modal>
          );
        })}
      </Box>
    </Layout.AppSectionCard>
  );
};
