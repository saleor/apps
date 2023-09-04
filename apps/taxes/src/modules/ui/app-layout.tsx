import { Box } from "@saleor/macaw-ui/next";
import React from "react";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box display={"flex"} flexDirection={"column"} gap={8} paddingY={4}>
      {children}
    </Box>
  );
};
