import { Box, Button } from "@saleor/macaw-ui";
import { type ReactNode, useEffect, useRef } from "react";

import { ConfirmButton, type ConfirmButtonTransitionState } from "../confirm-button/confirm-button";
import { DashboardModal, type DashboardModalContentSize } from "../dashboard-modal/dashboard-modal";

export type ActionDialogVariant = "default" | "delete" | "info";

export interface ActionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  subtitle?: ReactNode;
  children?: ReactNode;
  confirmButtonState?: ConfirmButtonTransitionState;
  confirmButtonLabel?: string;
  /** Defaults to "Cancel". */
  backButtonText?: string;
  variant?: ActionDialogVariant;
  size?: DashboardModalContentSize;
  disabled?: boolean;
  /**
   * Blocks backdrop, Escape, Cancel, and the close button — used while a confirm write is
   * in flight so the dialog cannot be dismissed mid-request.
   */
  disableClose?: boolean;
  /**
   * When `confirmButtonState` becomes `success`, start the exit. Pair with `afterModalSuccess`
   * so the toast lands after the overlay has begun to leave. Defaults to true.
   */
  closeOnSuccess?: boolean;
  "data-test-id"?: string;
}

const defaultConfirmLabel = (variant: ActionDialogVariant | undefined): string => {
  if (variant === "delete") {
    return "Delete";
  }

  return "Confirm";
};

export const ActionDialog = ({
  children,
  open,
  title,
  subtitle,
  onClose,
  variant,
  confirmButtonState = "default",
  backButtonText = "Cancel",
  disabled,
  disableClose = false,
  closeOnSuccess = true,
  onConfirm,
  confirmButtonLabel,
  size = "sm",
  "data-test-id": dataTestId,
}: ActionDialogProps): JSX.Element => {
  const closedForSuccess = useRef(false);

  useEffect(() => {
    if (confirmButtonState !== "success") {
      closedForSuccess.current = false;

      return;
    }

    if (closeOnSuccess && open && !closedForSuccess.current) {
      closedForSuccess.current = true;
      onClose();
    }
  }, [closeOnSuccess, confirmButtonState, onClose, open]);

  return (
    <DashboardModal
      open={open}
      onChange={(nextOpen) => {
        if (!nextOpen && !disableClose) {
          onClose();
        }
      }}
    >
      <DashboardModal.Content
        size={size}
        disableEscapeKeyDown={disableClose}
        data-test-id={dataTestId}
      >
        <DashboardModal.Header subtitle={subtitle}>{title}</DashboardModal.Header>
        {children ? (
          <DashboardModal.Body>
            <DashboardModal.Inset>
              <Box fontSize={3}>{children}</Box>
            </DashboardModal.Inset>
          </DashboardModal.Body>
        ) : null}
        <DashboardModal.Actions>
          <Button
            data-test-id="back"
            variant="secondary"
            type="button"
            onClick={onClose}
            disabled={disableClose}
          >
            {backButtonText}
          </Button>
          {variant !== "info" && (
            <ConfirmButton
              transitionState={confirmButtonState}
              disabled={disabled}
              onClick={onConfirm}
              variant={variant === "delete" ? "error" : "primary"}
              data-test-id="submit"
            >
              {confirmButtonLabel ?? defaultConfirmLabel(variant)}
            </ConfirmButton>
          )}
        </DashboardModal.Actions>
      </DashboardModal.Content>
    </DashboardModal>
  );
};

ActionDialog.displayName = "ActionDialog";
