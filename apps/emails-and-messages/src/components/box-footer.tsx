import { Box, BoxProps } from "@saleor/macaw-ui/next";
import { defaultPadding } from "./ui-defaults";

export const BoxFooter = (props: BoxProps) => {
  return (
    <Box
      borderTopStyle="solid"
      borderWidth={1}
      borderColor="neutralDefault"
      padding={defaultPadding}
      display="flex"
      flexDirection="row"
      justifyContent="flex-end"
      {...props}
    >
      {props.children}
    </Box>
  );
};
