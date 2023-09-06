import { AppBridge, AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import { NoSSRWrapper, ThemeSynchronizer } from "@saleor/apps-shared";
import { Box, ThemeProvider } from "@saleor/macaw-ui/next";
import "@saleor/macaw-ui/next/style";
import { AppProps } from "next/app";

/**
 * Ensure instance is a singleton.
 */
export const appBridgeInstance = typeof window !== "undefined" ? new AppBridge() : undefined;

function SaleorApp({ Component, pageProps }: AppProps) {
  return (
    <NoSSRWrapper>
      <AppBridgeProvider appBridgeInstance={appBridgeInstance}>
        <ThemeProvider>
          <ThemeSynchronizer />
          <Box padding={10}>
            <Component {...pageProps} />
          </Box>
        </ThemeProvider>
      </AppBridgeProvider>
    </NoSSRWrapper>
  );
}

export default SaleorApp;
