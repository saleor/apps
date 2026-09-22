import { Button } from "@saleor/macaw-ui";
import { type ReactNode, useRef } from "react";

import { DashboardModal } from "../dashboard-modal/dashboard-modal";

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
 *
 * Header-only confirmation: title + subtitle, then actions. Same chrome as Dashboard
 * `ExitFormDialog` — no body, so the header divider is hidden and the actions bar separates.
 */
export const ExitFormDialog = ({
  isOpen,
  onClose,
  onLeave,
  description = "You have unsaved changes. They will be lost if you leave this page.",
}: ExitFormDialogProps): JSX.Element => {
  /*
   * Ignore-changes calls onLeave, which sets `open` false. Modal onChange(false) must not
   * also run onClose ("keep editing") — that clears the pending navigation target.
   */
  const isLeavingRef = useRef(false);

  return (
    <DashboardModal
      open={isOpen}
      onChange={(open) => {
        if (!open) {
          if (isLeavingRef.current) {
            isLeavingRef.current = false;

            return;
          }

          onClose();
        }
      }}
    >
      <DashboardModal.Content size="sm" data-test-id="exit-form-dialog">
        <DashboardModal.Header
          subtitle={
            description ? (
              <span data-test-id="exit-form-dialog-description">{description}</span>
            ) : undefined
          }
        >
          Leave without saving changes?
        </DashboardModal.Header>
        <DashboardModal.Actions>
          <Button variant="secondary" onClick={onClose} data-test-id="keep-editing">
            Keep editing
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              isLeavingRef.current = true;
              onLeave();
            }}
            data-test-id="ignore-changes"
          >
            Ignore changes
          </Button>
        </DashboardModal.Actions>
      </DashboardModal.Content>
    </DashboardModal>
  );
};
