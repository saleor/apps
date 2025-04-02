import "@saleor/macaw-ui/style";

import { AppBridge, AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import { RoutePropagator } from "@saleor/app-sdk/app-bridge/next";
import { GraphQLProvider } from "@saleor/apps-shared/graphql-provider";
import { NoSSRWrapper } from "@saleor/apps-shared/no-ssr-wrapper";
import { ThemeSynchronizer } from "@saleor/apps-shared/theme-synchronizer";
import { Box, ThemeProvider } from "@saleor/macaw-ui";
import { AppProps } from "next/app";

import { trpcClient } from "@/modules/trpc/trpc-client";

/**
 * Ensure instance is a singleton.
 * TODO: This is React 18 issue, consider hiding this workaround inside app-sdk
 */
export const appBridgeInstance = typeof window !== "undefined" ? new AppBridge() : undefined;

function NextApp({ Component, pageProps }: AppProps) {
  return (
    <NoSSRWrapper>
      <AppBridgeProvider appBridgeInstance={appBridgeInstance}>
        <GraphQLProvider>
          <ThemeProvider>
            <ThemeSynchronizer />
            <RoutePropagator />
            <Box padding={10}>
              <Component {...pageProps} />
            </Box>
          </ThemeProvider>
        </GraphQLProvider>
      </AppBridgeProvider>
    </NoSSRWrapper>
  );
}

export default trpcClient.withTRPC(NextApp);
