import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { DeleteConfigurationModalContent, Layout } from "@saleor/apps-ui";
import { Box, Button, Modal, Text, TrashBinIcon } from "@saleor/macaw-ui";
import { useRouter } from "next/router";
import { useState } from "react";

import { AppChannelConfig, AppChannelConfigFields } from "@/modules/app-config/app-config";
import { trpcClient } from "@/modules/trpc/trpc-client";

type Props = {
  configs: Array<AppChannelConfigFields>;
};

export const ConfigsList = ({ configs, ...props }: Props) => {
  const router = useRouter();
  const { notifyError, notifySuccess } = useDashboardNotification();
  const configsList = trpcClient.appConfig.getConfigsList.useQuery();
  const mappings = trpcClient.appConfig.channelsConfigsMapping.useQuery();
  const [configIdContext, setConfigIdContext] = useState<string | null>(null);
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

  const modalOpen = Boolean(configIdContext);
  const closeModal = () => setConfigIdContext(null);

  return (
    <Layout.AppSectionCard
      footer={
        <Box display="flex" justifyContent="flex-end">
          <Button onClick={() => router.push("/config/new")}>Add configuration</Button>
        </Box>
      }
    >
      <Box {...props}>
        <Modal open={modalOpen} onChange={closeModal}>
          <DeleteConfigurationModalContent
            onDeleteClick={() => {
              if (!configIdContext) {
                throw new Error("Invariant, modal should be open only when configIdContext is set");
              }

              mutate({ configId: configIdContext });
              closeModal();
            }}
          />
        </Modal>

        {configs.map((config) => {
          const configInstanceResult = AppChannelConfig.create(config);
          const configInstance = configInstanceResult.unwrapOr(null);

          if (!configInstance) {
            return <div>Error</div>;
          }

          return (
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
                <Button
                  disabled={isLoading}
                  marginLeft={4}
                  display="block"
                  icon={<TrashBinIcon />}
                  variant="secondary"
                  onClick={() => setConfigIdContext(configInstance.id)}
                />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Layout.AppSectionCard>
  );
};
