import { Box, BoxProps } from "@saleor/macaw-ui";

import { defaultPadding } from "./ui-defaults";

export const BoxFooter = (props: BoxProps) => {
  return (
    <Box
      borderTopStyle="solid"
      borderWidth={1}
      borderColor="default1"
      padding={defaultPadding}
      display="flex"
      gap={defaultPadding}
      flexDirection="row"
      justifyContent="flex-end"
      alignItems="center"
      {...props}
    >
      {props.children}
    </Box>
  );
};
