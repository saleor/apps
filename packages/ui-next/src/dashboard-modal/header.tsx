import { Box } from "@saleor/macaw-ui";
import { type ReactNode } from "react";

import { Close } from "./close";
import { ContextHeader } from "./context-header";
import styles from "./dashboard-modal.module.css";
import { ModalChromeHeader } from "./modal-chrome-header";
import { MODAL_HEADER_DISPLAY_NAME } from "./modal-display-names";
import { ModalDivider } from "./modal-divider";
import { Title, type TitleProps } from "./title";
import { MODAL_HEADER_DIVIDER_GAP_SPACING } from "./tokens";

type HeaderProps =
  | ({ children: ReactNode; subtitle?: undefined } & TitleProps)
  | { children: ReactNode; subtitle: ReactNode };

export const Header = (props: HeaderProps): JSX.Element => {
  if (props.subtitle) {
    const { children, subtitle } = props;

    return <ContextHeader description={subtitle}>{children}</ContextHeader>;
  }

  const { children, ...rest } = props;

  return (
    <Box
      className={styles.modalChromeHeaderWrapper}
      display="flex"
      flexDirection="column"
      flexShrink="0"
      gap={MODAL_HEADER_DIVIDER_GAP_SPACING}
    >
      <ModalChromeHeader>
        <Box minWidth={0}>
          <Title {...rest}>{children}</Title>
        </Box>
        <Close />
      </ModalChromeHeader>
      <ModalDivider />
    </Box>
  );
};

Header.displayName = MODAL_HEADER_DISPLAY_NAME;
