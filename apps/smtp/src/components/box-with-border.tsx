import { Box, BoxProps } from "@saleor/macaw-ui";

export const BoxWithBorder = (props: BoxProps) => {
  return (
    <Box borderWidth={1} borderStyle="solid" borderColor="default1" borderRadius={5} {...props}>
      {props.children}
    </Box>
  );
};
