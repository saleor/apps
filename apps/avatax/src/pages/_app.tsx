/* eslint-disable react-naming-convention/filename */
import "@saleor/macaw-ui/style";
import "../styles/globals.css";

import { AppBridge, AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import { RoutePropagator } from "@saleor/app-sdk/app-bridge/next";
import { IframeProtectedFallback } from "@saleor/apps-shared/iframe-protected-fallback";
import { IframeProtectedWrapper } from "@saleor/apps-shared/iframe-protected-wrapper";
import { NoSSRWrapper } from "@saleor/apps-shared/no-ssr-wrapper";
import { ThemeSynchronizer } from "@saleor/apps-shared/theme-synchronizer";
import { Text, ThemeProvider } from "@saleor/macaw-ui";
import { AppProps } from "next/app";

import { trpcClient } from "../modules/trpc/trpc-client";
import { AppLayout } from "../modules/ui/app-layout";
import { GraphQLProvider } from "../providers/GraphQLProvider";

/**
 * Ensure instance is a singleton.
 * TODO: This is React 18 issue, consider hiding this workaround inside app-sdk
 */
export const appBridgeInstance = typeof window !== "undefined" ? new AppBridge() : undefined;

function NextApp({ Component, pageProps }: AppProps) {
  if (pageProps.skipApp) {
    return <Component {...pageProps} />;
  }

  return (
    <NoSSRWrapper>
      <ThemeProvider>
        <IframeProtectedWrapper
          allowedPathNames={["/", "/order-details"]}
          fallback={<IframeProtectedFallback appName="Saleor AvaTax App" />}
        >
          <AppBridgeProvider appBridgeInstance={appBridgeInstance}>
            <GraphQLProvider>
              <ThemeSynchronizer />
              <RoutePropagator />
              <AppLayout>
                <Component {...pageProps} />
              </AppLayout>
            </GraphQLProvider>
          </AppBridgeProvider>
        </IframeProtectedWrapper>
      </ThemeProvider>
    </NoSSRWrapper>
  );
}

export default trpcClient.withTRPC(NextApp);
