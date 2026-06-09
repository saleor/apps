/* eslint-disable react-naming-convention/filename */
import "@saleor/macaw-ui/style";
import "../styles/globals.css";

import { AppBridge, AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import { RoutePropagator } from "@saleor/app-sdk/app-bridge/next";
import { IframeProtectedFallback } from "@saleor/apps-shared/iframe-protected-fallback";
import { IframeProtectedWrapper } from "@saleor/apps-shared/iframe-protected-wrapper";
import { NoSSRWrapper } from "@saleor/apps-shared/no-ssr-wrapper";
import { ThemeSynchronizer } from "@saleor/apps-shared/theme-synchronizer";
import { ThemeProvider } from "@saleor/macaw-ui";
import { type AppProps } from "next/app";
import { useRouter } from "next/router";

import { trpcClient } from "../modules/trpc/trpc-client";
import { AppLayout } from "../modules/ui/app-layout";
import { GraphQLProvider } from "../providers/GraphQLProvider";

/**
 * Ensure instance is a singleton.
 * TODO: This is React 18 issue, consider hiding this workaround inside app-sdk
 */
export const appBridgeInstance = typeof window !== "undefined" ? new AppBridge() : undefined;

function AppShell({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isOrderDetailsWidget = router.pathname === "/order-details";

  return (
    <IframeProtectedWrapper
      allowedPathNames={["/", "/order-details"]}
      fallback={<IframeProtectedFallback appName="Saleor AvaTax App" />}
    >
      <AppBridgeProvider appBridgeInstance={appBridgeInstance}>
        <GraphQLProvider>
          <ThemeSynchronizer />
          {!isOrderDetailsWidget && <RoutePropagator />}
          {isOrderDetailsWidget ? (
            <Component {...pageProps} />
          ) : (
            <AppLayout>
              <Component {...pageProps} />
            </AppLayout>
          )}
        </GraphQLProvider>
      </AppBridgeProvider>
    </IframeProtectedWrapper>
  );
}

function NextApp(props: AppProps) {
  return (
    <NoSSRWrapper>
      <ThemeProvider>
        <AppShell {...props} />
      </ThemeProvider>
    </NoSSRWrapper>
  );
}

export default trpcClient.withTRPC(NextApp);
