import { Box } from "@saleor/macaw-ui";

import styles from "./dashboard-modal.module.css";
import { MODAL_DIVIDER_DISPLAY_NAME } from "./modal-display-names";

export const ModalDivider = (): JSX.Element => (
  <Box
    className={styles.fullBleedDivider}
    width="100%"
    height="px"
    backgroundColor="default3"
    borderWidth={0}
    flexShrink="0"
  />
);

ModalDivider.displayName = MODAL_DIVIDER_DISPLAY_NAME;
