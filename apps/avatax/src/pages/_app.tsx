/* eslint-disable react-naming-convention/filename */
import "@saleor/macaw-ui/style";
import "../styles/globals.css";

import { AppBridge, AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import { RoutePropagator } from "@saleor/app-sdk/app-bridge/next";
import { IframeProtectedWrapper } from "@saleor/apps-shared/iframe-protected-wrapper";
import { NoSSRWrapper } from "@saleor/apps-shared/no-ssr-wrapper";
import { ThemeSynchronizer } from "@saleor/apps-shared/theme-synchronizer";
import { ThemeProvider } from "@saleor/macaw-ui";
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
      <IframeProtectedWrapper
        allowedPathNames={["/"]}
        fallback={
          <ThemeProvider>
            <AppLayout>
              <div>
                <h1>Saleor AvaTax App</h1>
                <p>This app can only be used within the Saleor Dashboard.</p>
                <p>Please install and open this app through your Saleor Dashboard.</p>
              </div>
            </AppLayout>
          </ThemeProvider>
        }
      >
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
      </IframeProtectedWrapper>
    </NoSSRWrapper>
  );
}

export default trpcClient.withTRPC(NextApp);
