import { Box, Button, type ButtonProps } from "@saleor/macaw-ui";
import { type ReactNode } from "react";

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

const ConfirmButton = ({
  children,
  ...props
}: { children: ReactNode } & ButtonProps): JSX.Element => (
  <Button size="large" data-test-id="button-bar-confirm" type="submit" {...props}>
    {children}
  </Button>
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
  DeleteButton,
  ConfirmButton,
  CancelButton,
});
