import { Box, Button, type ButtonProps } from "@saleor/macaw-ui";
import clsx from "clsx";
import { Check, Loader2 } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { iconSize, iconStrokeWidthBySize } from "../icons";
import styles from "./savebar.module.css";

export interface SavebarProps {
  children: ReactNode;
  "data-test-id"?: string;
}

const SavebarRoot = ({ children, "data-test-id": dataTestId }: SavebarProps): JSX.Element => (
  <Box as="footer" className={styles.savebar} data-test-id={dataTestId ?? "savebar"}>
    {children}
  </Box>
);

const Spacer = (): JSX.Element => <Box className={styles.spacer} />;

const DeleteButton = ({
  children,
  ...props
}: { children: ReactNode } & ButtonProps): JSX.Element => (
  <Button variant="error" size="large" data-test-id="button-bar-delete" type="button" {...props}>
    {children}
  </Button>
);

/** How long the success / error state stays before falling back to the label. */
const COMPLETED_STATE_SHOW_TIME_MS = 3000;

export type ConfirmButtonTransitionState = "default" | "loading" | "success" | "error";

export interface ConfirmButtonProps extends Omit<ButtonProps, "children"> {
  children?: ReactNode;
  /**
   * Drives the button feedback: spinner while `loading`, checkmark on `success`,
   * error variant with `errorLabel` on `error`. Defaults to `default` (plain label).
   */
  transitionState?: ConfirmButtonTransitionState;
  /** Shown instead of `children` in the `error` state. */
  errorLabel?: ReactNode;
  /** Skip the timed fallback and mirror `transitionState` directly (useful in tests). */
  noTransition?: boolean;
  onTransitionToDefault?: () => void;
}

const ConfirmButton = ({
  children,
  transitionState = "default",
  errorLabel = "Try again",
  noTransition = false,
  onTransitionToDefault,
  className,
  disabled,
  variant,
  onClick,
  ...props
}: ConfirmButtonProps): JSX.Element => {
  const [showCompletedState, setShowCompletedState] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>();

  const isLoading = transitionState === "loading";
  const isCompleted = noTransition ? transitionState !== "default" : showCompletedState;
  const isSuccess = transitionState === "success" && isCompleted;
  const isError = transitionState === "error" && isCompleted;
  const isInteractionLocked = isLoading || isSuccess;
  /** Stays enabled while completed feedback shows, so the variant color does not flicker. */
  const isDisabled = !isCompleted && Boolean(disabled);

  useEffect(() => {
    if (!noTransition && isLoading) {
      setShowCompletedState(true);
    }
  }, [noTransition, isLoading]);

  useEffect(() => {
    if (noTransition) {
      return;
    }

    if (transitionState === "success" || transitionState === "error") {
      timeout.current = setTimeout(() => {
        setShowCompletedState(false);
        onTransitionToDefault?.();
      }, COMPLETED_STATE_SHOW_TIME_MS);
    } else if (isLoading) {
      clearTimeout(timeout.current);
    }

    return () => clearTimeout(timeout.current);
  }, [noTransition, transitionState, isLoading, onTransitionToDefault]);

  const statusIcon = isLoading ? (
    <Loader2
      className={styles.spinner}
      size={iconSize.medium}
      strokeWidth={iconStrokeWidthBySize.medium}
      aria-hidden
      data-test-id="button-progress"
    />
  ) : isSuccess ? (
    <Check
      size={iconSize.medium}
      strokeWidth={iconStrokeWidthBySize.medium}
      aria-hidden
      data-test-id="button-success"
    />
  ) : null;

  return (
    <Button
      size="large"
      data-test-id="button-bar-confirm"
      type="submit"
      {...props}
      variant={isError ? "error" : variant}
      className={clsx(className, (isInteractionLocked || isDisabled) && styles.noInteraction)}
      disabled={isDisabled}
      aria-busy={isLoading}
      tabIndex={isInteractionLocked ? -1 : undefined}
      onClick={isInteractionLocked ? undefined : onClick}
      data-test-state={isCompleted ? transitionState : "default"}
    >
      <Box as="span" className={styles.confirmContent}>
        {statusIcon ? (
          <Box as="span" className={styles.confirmStatus}>
            {statusIcon}
          </Box>
        ) : null}
        <Box
          as="span"
          className={clsx(styles.confirmLabel, statusIcon && styles.confirmLabelHidden)}
        >
          {isError ? errorLabel : children}
        </Box>
      </Box>
    </Button>
  );
};

const CancelButton = ({
  children,
  ...props
}: { children: ReactNode } & ButtonProps): JSX.Element => (
  <Button
    variant="secondary"
    size="large"
    data-test-id="button-bar-cancel"
    type="button"
    {...props}
  >
    {children}
  </Button>
);

export const Savebar = Object.assign(SavebarRoot, {
  Spacer,
  DeleteButton,
  ConfirmButton,
  CancelButton,
});
