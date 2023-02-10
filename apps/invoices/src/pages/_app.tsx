import "../styles/globals.css";
import { AppBridge, AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import { RoutePropagator } from "@saleor/app-sdk/app-bridge/next";
import React, { useEffect } from "react";
import { AppProps } from "next/app";

import GraphQLProvider from "../providers/GraphQLProvider";
import { ThemeSynchronizer } from "../lib/theme-synchronizer";
import { NoSSRWrapper } from "../lib/no-ssr-wrapper";
import { trpcClient } from "../modules/trpc/trpc-client";
import { MacawThemeProvider } from "@saleor/apps-shared";

/**
 * Ensure instance is a singleton.
 * TODO: This is React 18 issue, consider hiding this workaround inside app-sdk
 */
export const appBridgeInstance = typeof window !== "undefined" ? new AppBridge() : undefined;

function NextApp({ Component, pageProps }: AppProps) {
  /**
   * Configure JSS (used by MacawUI) for SSR. If Macaw is not used, can be removed.
   */
  useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles?.parentElement?.removeChild(jssStyles);
    }
  }, []);

  return (
    <NoSSRWrapper>
      <AppBridgeProvider appBridgeInstance={appBridgeInstance}>
        <GraphQLProvider>
          <MacawThemeProvider>
            <ThemeSynchronizer />
            <RoutePropagator />
            <Component {...pageProps} />
          </MacawThemeProvider>
        </GraphQLProvider>
      </AppBridgeProvider>
    </NoSSRWrapper>
  );
}

export default trpcClient.withTRPC(NextApp);
