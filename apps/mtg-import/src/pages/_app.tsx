import "@saleor/macaw-ui/style";
import "@/ui/styles/globals.css";

import { AppBridge, AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import { RoutePropagator } from "@saleor/apps-shared/route-propagator";
import { GraphQLProvider } from "@saleor/apps-shared/graphql-provider";
import { IframeProtectedFallback } from "@saleor/apps-shared/iframe-protected-fallback";
import { IframeProtectedWrapper } from "@saleor/apps-shared/iframe-protected-wrapper";
import { NoSSRWrapper } from "@saleor/apps-shared/no-ssr-wrapper";
import { ThemeSynchronizer } from "@saleor/apps-shared/theme-synchronizer";
import { Box, ThemeProvider } from "@saleor/macaw-ui";
import { AppProps } from "next/app";

import { trpcClient } from "@/modules/trpc/trpc-client";
import { AppLayout } from "@/ui/components";

/**
 * Polyfill for crypto.randomUUID() in non-secure contexts (HTTP).
 */
if (typeof window !== "undefined" && typeof crypto !== "undefined" && !crypto.randomUUID) {
  crypto.randomUUID = function randomUUID(): `${string}-${string}-${string}-${string}-${string}` {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}` as `${string}-${string}-${string}-${string}-${string}`;
  };
}

/**
 * AppBridge singleton for React 18 StrictMode compatibility.
 *
 * React 18 StrictMode double-mounts components in development, which would
 * create multiple AppBridge instances and break the Saleor Dashboard ↔ App
 * communication channel. Hoisting the instance to module scope ensures only
 * one AppBridge exists regardless of re-renders.
 */
export const appBridgeInstance = typeof window !== "undefined" ? new AppBridge() : undefined;

function NextApp({ Component, pageProps }: AppProps) {
  return (
    <NoSSRWrapper>
      <ThemeProvider>
        <IframeProtectedWrapper
          allowedPathNames={[
            "/",
            "/import",
            "/import/new",
            "/import/[id]",
            "/sets",
            "/settings",
          ]}
          fallback={<IframeProtectedFallback appName="MTG Import" />}
        >
          <AppBridgeProvider appBridgeInstance={appBridgeInstance}>
            <GraphQLProvider>
              <ThemeSynchronizer />
              <RoutePropagator />
              <Box padding={6}>
                <AppLayout>
                  <Component {...pageProps} />
                </AppLayout>
              </Box>
            </GraphQLProvider>
          </AppBridgeProvider>
        </IframeProtectedWrapper>
      </ThemeProvider>
    </NoSSRWrapper>
  );
}

export default trpcClient.withTRPC(NextApp);
