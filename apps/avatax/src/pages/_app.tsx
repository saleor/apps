import "../styles/globals.css";
import "@saleor/macaw-ui/style";
import { AppBridge, AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import { RoutePropagator } from "@saleor/app-sdk/app-bridge/next";
import { ThemeProvider } from "@saleor/macaw-ui";

import { AppProps } from "next/app";

import { ThemeSynchronizer } from "../lib/theme-synchronizer";
import { trpcClient } from "../modules/trpc/trpc-client";
import { GraphQLProvider } from "../providers/GraphQLProvider";
import { NoSSRWrapper } from "@saleor/apps-shared";
import { AppLayout } from "../modules/ui/app-layout";

/**
 * Ensure instance is a singleton.
 * TODO: This is React 18 issue, consider hiding this workaround inside app-sdk
 */
export const appBridgeInstance = typeof window !== "undefined" ? new AppBridge() : undefined;

function NextApp({ Component, pageProps }: AppProps) {
  return (
    <NoSSRWrapper>
      <AppBridgeProvider appBridgeInstance={appBridgeInstance}>
        <GraphQLProvider>
          <ThemeProvider>
            <ThemeSynchronizer />
            <RoutePropagator />
            <AppLayout>
              <Component {...pageProps} />
            </AppLayout>
          </ThemeProvider>
        </GraphQLProvider>
      </AppBridgeProvider>
    </NoSSRWrapper>
  );
}

export default trpcClient.withTRPC(NextApp);
