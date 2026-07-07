import { Box, Button, Modal, Text } from "@saleor/macaw-ui";
import { type ReactNode } from "react";

/**
 * Confirmation dialog for the destructive actions (anonymizing orders and
 * deleting customers). These operations are irreversible, so they must not run
 * directly on click - the user has to confirm in this modal first.
 */
export const ConfirmationModal = ({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  return (
    <Modal open={open} onChange={(nextOpen) => !nextOpen && onCancel()}>
      <Modal.Content>
        <Box
          backgroundColor="default1"
          boxShadow="defaultModal"
          __left="50%"
          __top="50%"
          position="fixed"
          __maxWidth="600px"
          __width="calc(100% - 64px)"
          __transform="translate(-50%, -50%)"
          padding={6}
          display="grid"
          gap={4}
          borderRadius={4}
        >
          <Text size={6} fontWeight="bold">
            {title}
          </Text>
          <Text>{description}</Text>
          <Box display="flex" justifyContent="flex-end" gap={3}>
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="error" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </Box>
        </Box>
      </Modal.Content>
    </Modal>
  );
};
