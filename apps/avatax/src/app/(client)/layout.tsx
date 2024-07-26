"use client";
import "@saleor/macaw-ui/style";
import "../../styles/globals.css";

import { trpcClient } from "@/modules/trpc/trpc-client";
import { AppLayout } from "@/modules/ui/app-layout";
import { RoutePropagator } from "@saleor/app-sdk/app-bridge/next";
import { GraphQLProvider, ThemeSynchronizer } from "@saleor/apps-shared";
import { ThemeProvider } from "@saleor/macaw-ui";

function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <GraphQLProvider>
      <ThemeProvider>
        <ThemeSynchronizer />
        <RoutePropagator />
        <AppLayout>{children}</AppLayout>
      </ThemeProvider>
    </GraphQLProvider>
  );
}

export default trpcClient.withTRPC(ClientLayout);
