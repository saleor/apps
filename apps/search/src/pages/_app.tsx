import "../styles/globals.css";
import "@saleor/macaw-ui/next/style";
import { AppBridge, AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import React from "react";
import { AppProps } from "next/app";
import { GraphQLProvider } from "../providers/GraphQLProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RoutePropagator } from "@saleor/app-sdk/app-bridge/next";
import { ThemeSynchronizer } from "../lib/theme-synchronizer";
import { Box, ThemeProvider } from "@saleor/macaw-ui/next";
import { NoSSRWrapper } from "@saleor/apps-shared";

/**
 * Ensure instance is a singleton.
 * TODO: This is React 18 issue, consider hiding this workaround inside app-sdk
 */
const appBridgeInstance = typeof window !== "undefined" ? new AppBridge() : undefined;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function NextApp({ Component, pageProps }: AppProps) {
  return (
    <NoSSRWrapper>
      <AppBridgeProvider appBridgeInstance={appBridgeInstance}>
        <GraphQLProvider>
          <ThemeProvider>
            <ThemeSynchronizer />
            <RoutePropagator />
            <QueryClientProvider client={queryClient}>
              <Box padding={10}>
                <Component {...pageProps} />
              </Box>
            </QueryClientProvider>
          </ThemeProvider>
        </GraphQLProvider>
      </AppBridgeProvider>
    </NoSSRWrapper>
  );
}

export default NextApp;
