import { Box, type PropsWithBox } from "@saleor/macaw-ui";
import { type ReactNode } from "react";

import styles from "./dashboard-modal.module.css";
import { MODAL_ACTIONS_DISPLAY_NAME } from "./modal-display-names";

export const Actions = ({
  children,
  ...rest
}: PropsWithBox<{ children: ReactNode }>): JSX.Element => (
  <Box
    className={styles.actions}
    display="flex"
    justifyContent="flex-end"
    gap={4}
    flexShrink="0"
    {...rest}
  >
    {children}
  </Box>
);

Actions.displayName = MODAL_ACTIONS_DISPLAY_NAME;
