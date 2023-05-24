import { Box, BoxProps } from "@saleor/macaw-ui/next";

export const BoxWithBorder = (props: BoxProps) => {
  return (
    <Box
      borderWidth={1}
      borderStyle="solid"
      borderColor="neutralDefault"
      borderRadius={5}
      {...props}
    >
      {props.children}
    </Box>
  );
};
