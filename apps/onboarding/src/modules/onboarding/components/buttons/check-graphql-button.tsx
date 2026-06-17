"use client";

import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Button } from "@saleor/macaw-ui";

import { type PrimaryActionProps } from "./types";

export const CheckGraphQLButton = ({ onClick }: PrimaryActionProps) => {
  const { appBridgeState } = useAppBridge();
  const saleorApiUrl = appBridgeState?.saleorApiUrl;

  return (
    <Button
      variant="primary"
      disabled={!saleorApiUrl}
      onClick={() => {
        onClick?.();
        if (saleorApiUrl) {
          window.open(saleorApiUrl, "_blank", "noopener,noreferrer");
        }
      }}
    >
      Go to GraphQL Playground
    </Button>
  );
};
