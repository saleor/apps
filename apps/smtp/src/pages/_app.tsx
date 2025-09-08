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

/**
 * Ensure instance is a singleton.
 * TODO: This is React 18 issue, consider hiding this workaround inside app-sdk
 */
export const appBridgeInstance = typeof window !== "undefined" ? new AppBridge() : undefined;

function NextApp({ Component, pageProps }: AppProps) {
  return (
    <NoSSRWrapper>
      <IframeProtectedWrapper
        allowedPathNames={["/"]}
        fallback={
          <ThemeProvider defaultTheme="defaultLight">
            <Box display="flex" flexDirection="column" padding={4}>
              <Text as="h1" fontWeight="bold" fontSize={8} marginBottom={6}>
                Saleor SMTP App
              </Text>
              <Text>This app can only be used within the Saleor Dashboard.</Text>
            </Box>
          </ThemeProvider>
        }
      >
        <AppBridgeProvider appBridgeInstance={appBridgeInstance}>
          <ThemeProvider defaultTheme="defaultLight">
            <ThemeSynchronizer />
            <RoutePropagator />
            <Component {...pageProps} />
          </ThemeProvider>
        </AppBridgeProvider>
      </IframeProtectedWrapper>
    </NoSSRWrapper>
  );
}

export default trpcClient.withTRPC(NextApp);
