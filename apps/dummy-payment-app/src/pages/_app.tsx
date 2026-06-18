import "@saleor/macaw-ui/style";
import "../styles/globals.css";

import { AppBridge, AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import { RoutePropagator } from "@saleor/app-sdk/app-bridge/next";
import { NoSSRWrapper } from "@saleor/apps-shared/no-ssr-wrapper";
import { ThemeSynchronizer } from "@saleor/apps-shared/theme-synchronizer";
import { ThemeProvider } from "@saleor/macaw-ui";
import { type AppProps } from "next/app";
import { useRouter } from "next/router";

import { AppBridgeGuard } from "@/components/app-bridge-guard";
import { AppLayout } from "@/components/app-layout";
import { WidgetLayout } from "@/components/widget-layout";
import { trpcClient } from "@/trpc-client";

import { GraphQLProvider } from "../providers/graph-ql-provider";

export const appBridgeInstance = typeof window !== "undefined" ? new AppBridge() : undefined;

function NextApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAppRoute = router.pathname.startsWith("/app");
  const isWidgetRoute = router.pathname.startsWith("/app/widgets");

  return (
    <NoSSRWrapper>
      <ThemeProvider defaultTheme="defaultLight">
        <AppBridgeProvider appBridgeInstance={appBridgeInstance}>
          <ThemeSynchronizer />
          <RoutePropagator />
          {isAppRoute ? (
            <AppBridgeGuard>
              <GraphQLProvider>
                {isWidgetRoute ? (
                  <WidgetLayout>
                    <Component {...pageProps} />
                  </WidgetLayout>
                ) : (
                  <AppLayout>
                    <Component {...pageProps} />
                  </AppLayout>
                )}
              </GraphQLProvider>
            </AppBridgeGuard>
          ) : (
            <Component {...pageProps} />
          )}
        </AppBridgeProvider>
      </ThemeProvider>
    </NoSSRWrapper>
  );
}

export default trpcClient.withTRPC(NextApp);
