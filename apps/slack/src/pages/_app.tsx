import { AppBridge, AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import { NoSSRWrapper } from "@saleor/apps-shared";
import { ThemeProvider } from "@saleor/macaw-ui";
import "@saleor/macaw-ui/style";
import { AppProps } from "next/app";
import { ThemeSynchronizer } from "../hooks/theme-synchronizer";

/**
 * Ensure instance is a singleton.
 */
export const appBridgeInstance = typeof window !== "undefined" ? new AppBridge() : undefined;

function SaleorApp({ Component, pageProps }: AppProps) {
  // @ts-ignore todo refactor
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <NoSSRWrapper>
      <AppBridgeProvider appBridgeInstance={appBridgeInstance}>
        <ThemeProvider>
          <ThemeSynchronizer />
          {getLayout(<Component {...pageProps} />)}
        </ThemeProvider>
      </AppBridgeProvider>
    </NoSSRWrapper>
  );
}

export default SaleorApp;
