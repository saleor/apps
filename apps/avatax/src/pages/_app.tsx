/* eslint-disable react-naming-convention/filename */
import "@saleor/macaw-ui/style";
import "../styles/globals.css";

import { AppBridge, AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import { RoutePropagator } from "@saleor/app-sdk/app-bridge/next";
import { IframeProtectedWrapper } from "@saleor/apps-shared/iframe-protected-wrapper";
import { NoSSRWrapper } from "@saleor/apps-shared/no-ssr-wrapper";
import { ThemeSynchronizer } from "@saleor/apps-shared/theme-synchronizer";
import { Box, Text, ThemeProvider } from "@saleor/macaw-ui";
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
              <Box display="flex" flexDirection="column" padding={4}>
                <Text as="h1" fontWeight="bold" fontSize={8} marginBottom={6}>
                  Saleor AvaTax App
                </Text>
                <Text>This app can only be used within the Saleor Dashboard.</Text>
                <Text>Please install and open this app through your Saleor Dashboard.</Text>
              </Box>
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
