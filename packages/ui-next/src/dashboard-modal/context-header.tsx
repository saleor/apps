import { Box, Text } from "@saleor/macaw-ui";
import { type ReactNode } from "react";

import { Close } from "./close";
import styles from "./dashboard-modal.module.css";
import { ModalChromeHeader } from "./modal-chrome-header";
import { MODAL_CONTEXT_HEADER_DISPLAY_NAME } from "./modal-display-names";
import { ModalDivider } from "./modal-divider";
import { Title } from "./title";
import { MODAL_HEADER_DIVIDER_GAP_SPACING } from "./tokens";

interface ContextHeaderProps {
  children: ReactNode;
  contextLabel?: ReactNode;
  description?: ReactNode;
  /** When false, renders description without default body text styling. */
  wrapDescription?: boolean;
  /** When false, renders contextLabel inline without the default badge chrome. */
  wrapContextLabel?: boolean;
}

export const ContextHeader = ({
  children,
  contextLabel,
  description,
  wrapDescription = true,
  wrapContextLabel = true,
}: ContextHeaderProps): JSX.Element => (
  <Box
    className={styles.modalChromeHeaderWrapper}
    display="flex"
    flexDirection="column"
    flexShrink="0"
    gap={MODAL_HEADER_DIVIDER_GAP_SPACING}
  >
    <ModalChromeHeader alignItems="flex-start">
      <Box display="flex" flexDirection="column" gap={3} minWidth={0}>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Title>{children}</Title>
          {contextLabel ? (
            wrapContextLabel ? (
              <Box className={styles.contextBadge} paddingX={2} paddingY={0.5}>
                {contextLabel}
              </Box>
            ) : (
              contextLabel
            )
          ) : null}
        </Box>
        {description ? (
          wrapDescription ? (
            <Text size={2} color="default2">
              {description}
            </Text>
          ) : (
            description
          )
        ) : null}
      </Box>
      <Close />
    </ModalChromeHeader>
    <ModalDivider />
  </Box>
);

ContextHeader.displayName = MODAL_CONTEXT_HEADER_DISPLAY_NAME;
