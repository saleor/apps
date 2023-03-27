import "../styles/globals.css";

import { AppBridge, AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import { RoutePropagator } from "@saleor/app-sdk/app-bridge/next";
import React, { ReactElement, ReactNode } from "react";
import { AppProps } from "next/app";

import { NoSSRWrapper } from "@saleor/apps-shared";
import { trpcClient } from "../modules/trpc/trpc-client";
import { ThemeProvider } from "@saleor/macaw-ui/next";

import "@saleor/macaw-ui/next/style";
import { NextPage } from "next";

/**
 * Ensure instance is a singleton.
 * TODO: This is React 18 issue, consider hiding this workaround inside app-sdk
 */
export let appBridgeInstance: AppBridge | undefined;

if (typeof window !== "undefined" && !appBridgeInstance) {
  appBridgeInstance = new AppBridge();
}

export type NextPageWithLayoutOverwrite<P = {}, IP = P> = NextPage<P, IP> & {
  overwriteLayout?: (page: ReactElement) => ReactElement;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayoutOverwrite;
};

function NextApp({ Component, pageProps: { session, ...pageProps } }: AppPropsWithLayout) {
  if (Component.overwriteLayout) {
    return Component.overwriteLayout(<Component {...pageProps} />);
  }

  return (
    <NoSSRWrapper>
      <AppBridgeProvider appBridgeInstance={appBridgeInstance}>
        <ThemeProvider defaultTheme="defaultLight">
          <RoutePropagator />
          <Component {...pageProps} />
        </ThemeProvider>
      </AppBridgeProvider>
    </NoSSRWrapper>
  );
}

export default trpcClient.withTRPC(NextApp);
