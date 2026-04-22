import { Box } from "@saleor/macaw-ui";
import React from "react";

interface AppContentProps {
  children: React.ReactNode;
}

export const AppContent = ({ children }: AppContentProps) => {
  return <Box __height="90vh">{children}</Box>;
};
