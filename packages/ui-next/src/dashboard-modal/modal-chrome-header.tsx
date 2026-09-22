import { Box, type PropsWithBox } from "@saleor/macaw-ui";
import { type ReactNode } from "react";

import { useModalLayoutContext } from "./modal-layout-context";
import { MODAL_PADDING_SPACING } from "./tokens";

type ModalChromeHeaderProps = PropsWithBox<{
  alignItems?: "center" | "flex-start";
  children: ReactNode;
}>;

export const ModalChromeHeader = ({
  alignItems = "center",
  children,
  ...rest
}: ModalChromeHeaderProps): JSX.Element => {
  const { isHeaderOnly } = useModalLayoutContext();

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems={alignItems}
      gap={4}
      flexShrink="0"
      paddingTop={MODAL_PADDING_SPACING}
      paddingX={MODAL_PADDING_SPACING}
      paddingBottom={isHeaderOnly ? MODAL_PADDING_SPACING : 0}
      {...rest}
    >
      {children}
    </Box>
  );
};
