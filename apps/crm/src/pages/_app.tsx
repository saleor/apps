import "../styles/globals.css";

import { Theme } from "@material-ui/core/styles";
import { AppBridge, AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import { RoutePropagator } from "@saleor/app-sdk/app-bridge/next";
import { ThemeProvider as MacawUIThemeProvider } from "@saleor/macaw-ui";
import React, { PropsWithChildren, useEffect } from "react";
import { AppProps } from "next/app";

import { ThemeSynchronizer } from "../lib/theme-synchronizer";
import { NoSSRWrapper } from "@saleor/apps-shared";
import { trpcClient } from "../modules/trpc/trpc-client";
import { AppBridgeSessionSaver } from "../modules/app-bridge-session";

const themeOverrides: Partial<Theme> = {
  /**
   * You can override MacawUI theme here
   */
};

/**
 * Ensure instance is a singleton.
 * TODO: This is React 18 issue, consider hiding this workaround inside app-sdk
 */
export let appBridgeInstance = typeof window !== "undefined" ? new AppBridge() : undefined;

/**
 * That's a hack required by Macaw-UI incompatibility with React@18
 */
const ThemeProvider = MacawUIThemeProvider as React.FC<
  PropsWithChildren<{ overrides?: Partial<Theme>; ssr: boolean }>
>;

function NextApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
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
        <ThemeProvider overrides={themeOverrides} ssr={false}>
          <ThemeSynchronizer />
          <RoutePropagator />
          <AppBridgeSessionSaver />
          <Component {...pageProps} />
        </ThemeProvider>
      </AppBridgeProvider>
    </NoSSRWrapper>
  );
}

export default trpcClient.withTRPC(NextApp);
