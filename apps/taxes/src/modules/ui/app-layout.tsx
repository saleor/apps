import { Box } from "@saleor/macaw-ui/next";
import React from "react";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return <Box padding={4}>{children}</Box>;
};
