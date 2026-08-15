import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useCallback, useMemo, useState } from "react";

const STORAGE_PREFIX = "saleor.stripe.setupChecklist.dismissed";

const storageKey = (saleorApiUrl: string | undefined) =>
  `${STORAGE_PREFIX}:${saleorApiUrl ?? "unknown"}`;

export const useStripeSetupCardDismiss = () => {
  const { appBridgeState } = useAppBridge();
  const key = useMemo(
    () => storageKey(appBridgeState?.saleorApiUrl),
    [appBridgeState?.saleorApiUrl],
  );

  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      return window.localStorage.getItem(key) === "1";
    } catch {
      return false;
    }
  });

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(key, "1");
    } catch {
      // ignore quota / private mode
    }
    setDismissed(true);
  }, [key]);

  const restore = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
    setDismissed(false);
  }, [key]);

  return { dismissed, dismiss, restore };
};
