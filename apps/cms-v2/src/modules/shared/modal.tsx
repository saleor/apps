import { Box, BoxProps } from "@saleor/macaw-ui/next";
import { forwardRef } from "react";

export const Modal = forwardRef<HTMLDialogElement, BoxProps>((props, ref) => {
  return (
    <Box
      padding={6}
      borderWidth={1}
      borderRadius={4}
      borderColor="neutralHighlight"
      as="dialog"
      ref={ref}
      __maxWidth="400px"
      boxShadow={"modal"}
      {...props}
    />
  );
});

Modal.displayName = "Modal";
