import "@saleor/macaw-ui/next/style";
import { AppBridge, AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import React from "react";
import { AppProps } from "next/app";
import { RoutePropagator } from "@saleor/app-sdk/app-bridge/next";
import { Box, ThemeProvider } from "@saleor/macaw-ui/next";
import { NoSSRWrapper } from "@saleor/apps-shared";
import { ThemeSynchronizer } from "../hooks/theme-synchronizer";

/**
 * Ensure instance is a singleton.
 */
export const appBridgeInstance = typeof window !== "undefined" ? new AppBridge() : undefined;

function SaleorApp({ Component, pageProps }: AppProps) {
  // @ts-ignore todo refactor
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <NoSSRWrapper>
      <AppBridgeProvider appBridgeInstance={appBridgeInstance}>
        <ThemeProvider>
          <ThemeSynchronizer />
          {getLayout(<Component {...pageProps} />)}
        </ThemeProvider>
      </AppBridgeProvider>
    </NoSSRWrapper>
  );
}

export default SaleorApp;
