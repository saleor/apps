"use client";

import { appBridgeInstance } from "@/modules/app/app-bridge";
import { AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import { NoSSRWrapper } from "@saleor/apps-shared";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <NoSSRWrapper>
      <AppBridgeProvider appBridgeInstance={appBridgeInstance}>
        <html lang="en">
          <body>{children}</body>
        </html>
      </AppBridgeProvider>
    </NoSSRWrapper>
  );
}
