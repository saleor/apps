import "../styles/globals.css";

import { Theme } from "@material-ui/core/styles";
import { AppBridge, AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import { RoutePropagator } from "@saleor/app-sdk/app-bridge/next";
import React, { useEffect } from "react";

import { AppLayoutProps } from "../../types";
import { ThemeSynchronizer } from "../hooks/theme-synchronizer";
import { NoSSRWrapper } from "../lib/no-ssr-wrapper";
import { MacawThemeProvider } from "@saleor/apps-shared";

const themeOverrides: Partial<Theme> = {
  overrides: {
    MuiTableCell: {
      body: {
        paddingBottom: 8,
        paddingTop: 8,
      },
      root: {
        height: 56,
        paddingBottom: 4,
        paddingTop: 4,
      },
    },
  },
};

/**
 * Ensure instance is a singleton.
 * TODO: This is React 18 issue, consider hiding this workaround inside app-sdk
 */
const appBridgeInstance =
  typeof window !== "undefined" ? new AppBridge({ autoNotifyReady: false }) : undefined;

function SaleorApp({ Component, pageProps }: AppLayoutProps) {
  const getLayout = Component.getLayout ?? ((page) => page);

  useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles?.parentElement?.removeChild(jssStyles);
    }
  }, []);

  return (
    <NoSSRWrapper>
      <AppBridgeProvider appBridgeInstance={appBridgeInstance}>
        <MacawThemeProvider themeOverrides={themeOverrides}>
          <ThemeSynchronizer />
          <RoutePropagator />
          {getLayout(<Component {...pageProps} />)}
        </MacawThemeProvider>
      </AppBridgeProvider>
    </NoSSRWrapper>
  );
}

export default SaleorApp;
