import "@saleor/macaw-ui/style";

import { AppBridge, AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import { IframeProtectedWrapper } from "@saleor/apps-shared/iframe-protected-wrapper";
import { NoSSRWrapper } from "@saleor/apps-shared/no-ssr-wrapper";
import { ThemeSynchronizer } from "@saleor/apps-shared/theme-synchronizer";
import { Box, Text, ThemeProvider } from "@saleor/macaw-ui";
import { AppProps } from "next/app";

/**
 * Ensure instance is a singleton.
 */
export const appBridgeInstance = typeof window !== "undefined" ? new AppBridge() : undefined;

function SaleorApp({ Component, pageProps }: AppProps) {
  return (
    <NoSSRWrapper>
      <ThemeProvider>
        <IframeProtectedWrapper
          allowedPathNames={["/"]}
          fallback={
            <Box display="flex" flexDirection="column" padding={4}>
              <Text as="h1" fontWeight="bold" fontSize={8} marginBottom={6}>
                Saleor Klaviyo App
              </Text>
              <Text>This app can only be used within the Saleor Dashboard.</Text>
            </Box>
          }
        >
          <AppBridgeProvider appBridgeInstance={appBridgeInstance}>
            <ThemeSynchronizer />
            <Box padding={10}>
              <Component {...pageProps} />
            </Box>
          </AppBridgeProvider>
        </IframeProtectedWrapper>
      </ThemeProvider>
    </NoSSRWrapper>
  );
}

export default SaleorApp;
