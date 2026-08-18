import { Box, Button, Modal, Text } from "@saleor/macaw-ui";
import { type ReactNode } from "react";

export interface ExitFormDialogProps {
  isOpen: boolean;
  /** Called when the user decides to stay on the page (backdrop, Escape, "Keep editing"). */
  onClose: () => void;
  /** Called when the user accepts losing the changes. */
  onLeave: () => void;
  description?: ReactNode;
}

/**
 * Asks for confirmation before navigating away from a form with unsaved changes.
 *
 * Apps run inside a Dashboard iframe sandboxed without `allow-modals`, so native
 * `window.confirm` and `beforeunload` prompts are suppressed — the confirmation has to be
 * rendered by the app itself.
 */
export const ExitFormDialog = ({
  isOpen,
  onClose,
  onLeave,
  description = "You have unsaved changes. They will be lost if you leave this page.",
}: ExitFormDialogProps): JSX.Element => (
  <Modal
    open={isOpen}
    onChange={(open) => {
      if (!open) {
        onClose();
      }
    }}
  >
    <Modal.Content>
      <Box
        backgroundColor="default1"
        boxShadow="defaultModal"
        __left="50%"
        __top="50%"
        position="fixed"
        __maxWidth="480px"
        __width="calc(100% - 64px)"
        __transform="translate(-50%, -50%)"
        padding={6}
        display="grid"
        gap={3}
        borderRadius={4}
        data-test-id="exit-form-dialog"
      >
        <Text size={6} fontWeight="bold">
          Leave without saving changes?
        </Text>
        <Text color="default2" data-test-id="exit-form-dialog-description">
          {description}
        </Text>
        <Box display="flex" justifyContent="flex-end" gap={3}>
          <Button variant="secondary" onClick={onClose} data-test-id="keep-editing">
            Keep editing
          </Button>
          <Button variant="primary" onClick={onLeave} data-test-id="ignore-changes">
            Ignore changes
          </Button>
        </Box>
      </Box>
    </Modal.Content>
  </Modal>
);
