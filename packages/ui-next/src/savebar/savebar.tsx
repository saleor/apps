import { Box, Button, type ButtonProps, Text } from "@saleor/macaw-ui";
import { type ReactNode } from "react";

import { ConfirmButton, type ConfirmButtonProps } from "../confirm-button/confirm-button";
import styles from "./savebar.module.css";

export type {
  ConfirmButtonProps,
  ConfirmButtonTransitionState,
} from "../confirm-button/confirm-button";

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

/**
 * Dashboard `SavebarCompositionHint`: names the dirty areas so the bar, not a locked control,
 * is what tells the merchant what will persist on Save.
 */
const Changes = ({
  segments,
  "data-test-id": dataTestId,
}: {
  segments: string[];
  "data-test-id"?: string;
}): JSX.Element | null => {
  if (segments.length === 0) {
    return null;
  }

  return (
    <Box className={styles.changes}>
      <Text size={2} color="default2" data-test-id={dataTestId ?? "savebar-changes"}>
        Unsaved changes: {segments.join(", ")}
      </Text>
    </Box>
  );
};

const DeleteButton = ({
  children,
  ...props
}: { children: ReactNode } & ButtonProps): JSX.Element => (
  <Button variant="error" size="large" data-test-id="button-bar-delete" type="button" {...props}>
    {children}
  </Button>
);

const SavebarConfirmButton = ({
  size = "large",
  type = "submit",
  ...props
}: ConfirmButtonProps): JSX.Element => (
  <ConfirmButton size={size} type={type} data-test-id="button-bar-confirm" {...props} />
);

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
  Changes,
  DeleteButton,
  ConfirmButton: SavebarConfirmButton,
  CancelButton,
});
