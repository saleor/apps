import { Box } from "@saleor/macaw-ui";
import { type ReactNode } from "react";

import { AppTabs } from "@/components/app-tabs";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <Box __minHeight="100vh" backgroundColor="default1">
      <AppTabs />
      <Box padding={6}>{children}</Box>
    </Box>
  );
}
