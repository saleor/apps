import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Box, Text } from "@saleor/macaw-ui";
import { type ReactNode } from "react";

import { SaleorThrobber } from "@/components/Throbber/saleor-throbber";

export function AppBridgeGuard({ children }: { children: ReactNode }) {
  const { appBridgeState } = useAppBridge();
  const isReady = appBridgeState?.ready && appBridgeState?.token;

  if (!isReady) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={3}
        __minHeight="100px"
        __color="var(--mu-colors-text-default2)"
      >
        <SaleorThrobber />
        <Text size={4} color="default2">
          Connecting to Saleor Dashboard...
        </Text>
      </Box>
    );
  }

  return <>{children}</>;
}
