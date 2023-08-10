import { Box, BoxProps } from "@saleor/macaw-ui/next";
import { forwardRef } from "react";

export const Modal = ({ onClose, ...rest }: { onClose(): void } & BoxProps) => {
  return (
    <>
      <Box
        padding={6}
        borderWidth={1}
        borderRadius={4}
        borderColor="neutralHighlight"
        as="dialog"
        __maxWidth="400px"
        boxShadow={"modal"}
        open
        {...rest}
      />
      <Box className="dialog-overlay" onClick={onClose} />
    </>
  );
};
