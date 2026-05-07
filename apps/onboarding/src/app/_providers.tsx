"use client";

import { AppBridge, AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import { GraphQLProvider } from "@saleor/apps-shared/graphql-provider";
import { NoSSRWrapper } from "@saleor/apps-shared/no-ssr-wrapper";
import { ThemeSynchronizer } from "@saleor/apps-shared/theme-synchronizer";
import { ThemeProvider } from "@saleor/macaw-ui";
import { type ReactNode } from "react";

// Singleton instance — recreated AppBridge during HMR triggers double-init in React 18 strict.
const appBridgeInstance = typeof window !== "undefined" ? new AppBridge() : undefined;

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <NoSSRWrapper>
      <ThemeProvider>
        <AppBridgeProvider appBridgeInstance={appBridgeInstance}>
          <GraphQLProvider>
            <ThemeSynchronizer />
            {children}
          </GraphQLProvider>
        </AppBridgeProvider>
      </ThemeProvider>
    </NoSSRWrapper>
  );
}
