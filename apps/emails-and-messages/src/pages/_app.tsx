import "../styles/globals.css";

import { Theme } from "@material-ui/core/styles";
import { AppBridge, AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import { RoutePropagator } from "@saleor/app-sdk/app-bridge/next";
import {
  dark,
  light,
  SaleorThemeColors,
  ThemeProvider as MacawUIThemeProvider,
} from "@saleor/macaw-ui";
import React, { PropsWithChildren, useEffect } from "react";
import { AppProps } from "next/app";

import { ThemeSynchronizer } from "../lib/theme-synchronizer";
import { NoSSRWrapper } from "../lib/no-ssr-wrapper";
import { trpcClient } from "../modules/trpc/trpc-client";
import { createGenerateClassName, StylesProvider } from "@material-ui/core";

type PalettesOverride = Record<"light" | "dark", SaleorThemeColors>;

/**
 * Temporary override of colors, to match new dashboard palette.
 * Long term this will be replaced with Macaw UI 2.x with up to date design tokens
 */
const palettes: PalettesOverride = {
  light: {
    ...light,
    background: {
      default: "#fff",
      paper: "#fff",
    },
  },
  dark: {
    ...dark,
    background: {
      default: "hsla(211, 42%, 14%, 1)",
      paper: "hsla(211, 42%, 14%, 1)",
    },
  },
};

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

const generateClassName = createGenerateClassName({
  productionPrefix: "c",
  disableGlobal: true,
});

/**
 * Ensure instance is a singleton.
 * TODO: This is React 18 issue, consider hiding this workaround inside app-sdk
 */
export const appBridgeInstance = typeof window !== "undefined" ? new AppBridge() : undefined;

/**
 * That's a hack required by Macaw-UI incompatibility with React@18
 */
const ThemeProvider = MacawUIThemeProvider as React.FC<
  PropsWithChildren<{ overrides?: Partial<Theme>; ssr: boolean; palettes: PalettesOverride }>
>;

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
        <StylesProvider generateClassName={generateClassName}>
          <ThemeProvider palettes={palettes} overrides={themeOverrides} ssr>
            <ThemeSynchronizer />
            <RoutePropagator />
            <Component {...pageProps} />
          </ThemeProvider>
        </StylesProvider>
      </AppBridgeProvider>
    </NoSSRWrapper>
  );
}

export default trpcClient.withTRPC(NextApp);
