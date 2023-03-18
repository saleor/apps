import { Box } from "@saleor/macaw-ui/next";
import { ComponentProps } from "react";

export const Layout = (props: ComponentProps<typeof Box>) => {
  return (
    <Box display="grid" __gridTemplateColumns="220px auto" gap={12}>
      {props.children}
    </Box>
  );
};
