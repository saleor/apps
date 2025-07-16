import { Box, Button, Modal, Text, TrashBinIcon } from "@saleor/macaw-ui";
import { ReactNode, useState } from "react";

import { DeleteConfigurationModalContent } from "./delete-configuration-modal-content";
import { Layout } from "./layout";

type Props = {
  configs: Array<{
    name: string;
    id: string;
  }>;
  onNewConfigAdd(): void;
  newConfigText?: string;
  onConfigDelete(configId: string): void;
  isLoading?: boolean;
  deleteButtonSlotLeft?(configId: string): ReactNode;
  deleteButtonSlotRight?(configId: string): ReactNode;
};

export const ConfigsList = ({
  configs,
  onNewConfigAdd,
  newConfigText = "Add new configuration",
  onConfigDelete,
  isLoading = false,
  deleteButtonSlotRight,
  deleteButtonSlotLeft,
  ...props
}: Props) => {
  const [configIdContext, setConfigIdContext] = useState<string | null>(null);

  const modalOpen = Boolean(configIdContext);
  const closeModal = () => setConfigIdContext(null);

  return (
    <Layout.AppSectionCard
      footer={
        <Box display="flex" justifyContent="flex-end">
          <Button onClick={onNewConfigAdd}>{newConfigText}</Button>
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

              onConfigDelete(configIdContext);
              closeModal();
            }}
          />
        </Modal>

        {configs.map((config) => {
          return (
            <Box paddingY={4} key={config.id}>
              <Box
                display={"flex"}
                justifyContent="space-between"
                width={"100%"}
                alignItems={"center"}
              >
                <Text marginRight={"auto"} display="block">
                  {config.name}
                </Text>
                {deleteButtonSlotLeft && deleteButtonSlotLeft(config.id)}
                <Button
                  disabled={isLoading}
                  marginLeft={4}
                  display="block"
                  icon={<TrashBinIcon />}
                  variant="secondary"
                  onClick={() => setConfigIdContext(config.id)}
                />
              </Box>
              {deleteButtonSlotRight && (
                <Box marginLeft={4}>{deleteButtonSlotRight(config.id)}</Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Layout.AppSectionCard>
  );
};
