import { Box } from "@saleor/macaw-ui/next";
import React from "react";
import { AppBreadcrumbs } from "./app-breadcrumbs";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box padding={4}>
      <Box as="header" marginBottom={10}>
        <AppBreadcrumbs />
      </Box>
      {children}
    </Box>
  );
};
