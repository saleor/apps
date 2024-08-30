import { Box, BoxProps } from "@saleor/macaw-ui";

export const Modal = ({ onClose, ...rest }: { onClose(): void } & BoxProps) => {
  return (
    <>
      <Box
        padding={6}
        borderWidth={1}
        borderRadius={4}
        borderColor="default1"
        as="dialog"
        __maxWidth="400px"
        boxShadow="defaultModal"
        backgroundColor="default1"
        color="default1"
        open
        {...rest}
      />
      <Box className="dialog-overlay" onClick={onClose} />
    </>
  );
};
