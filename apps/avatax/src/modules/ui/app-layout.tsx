import { Box } from "@saleor/macaw-ui";
import React from "react";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box display={"flex"} flexDirection={"column"} gap={8} paddingY={6} paddingX={6}>
      {children}
    </Box>
  );
};
