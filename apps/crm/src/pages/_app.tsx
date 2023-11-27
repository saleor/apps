import "@saleor/macaw-ui/style";
import "../styles/globals.css";

import { AppBridge, AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import { RoutePropagator } from "@saleor/app-sdk/app-bridge/next";
import React, { ReactElement } from "react";
import { AppProps } from "next/app";

import { NoSSRWrapper } from "@saleor/apps-shared";
import { trpcClient } from "../modules/trpc/trpc-client";
import { Box, ThemeProvider } from "@saleor/macaw-ui";

import { NextPage } from "next";
import { GraphQLProvider } from "../lib/graphql-provider";
import { AppBridgeStorageSetter } from "../lib/app-bridge-persistence";
import { ThemeSynchronizer } from "../lib/theme-synchronizer";

/**
 * Ensure instance is a singleton.
 * TODO: This is React 18 issue, consider hiding this workaround inside app-sdk
 */
export let appBridgeInstance: AppBridge | undefined;

if (typeof window !== "undefined" && !appBridgeInstance) {
  appBridgeInstance = new AppBridge();
}

/**
 * Implementation of layout pattern
 * https://nextjs.org/docs/basic-features/layouts#per-page-layouts
 *
 * In this app, there are pages inside the iframe, which will not use AppBridge etc, so they need
 * to provider custom tree of wrappers
 */
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
        <GraphQLProvider>
          <ThemeProvider defaultTheme="defaultLight">
            <ThemeSynchronizer />
            <RoutePropagator />
            <AppBridgeStorageSetter />
            <Box padding={5}>
              <Component {...pageProps} />
            </Box>
          </ThemeProvider>
        </GraphQLProvider>
      </AppBridgeProvider>
    </NoSSRWrapper>
  );
}

export default trpcClient.withTRPC(NextApp);
