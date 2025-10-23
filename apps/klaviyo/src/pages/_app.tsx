import "@saleor/macaw-ui/style";

import { AppBridge, AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import { IframeProtectedFallback } from "@saleor/apps-shared/iframe-protected-fallback";
import { IframeProtectedWrapper } from "@saleor/apps-shared/iframe-protected-wrapper";
import { NoSSRWrapper } from "@saleor/apps-shared/no-ssr-wrapper";
import { ThemeSynchronizer } from "@saleor/apps-shared/theme-synchronizer";
import { Box, ThemeProvider } from "@saleor/macaw-ui";
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
          fallback={<IframeProtectedFallback appName="Saleor Klaviyo App" />}
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
