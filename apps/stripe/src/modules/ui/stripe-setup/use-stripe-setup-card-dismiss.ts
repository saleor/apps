import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_PREFIX = "saleor.stripe.setupChecklist.dismissed";

const storageKey = (saleorApiUrl: string | undefined) =>
  `${STORAGE_PREFIX}:${saleorApiUrl ?? "unknown"}`;

const readDismissed = (key: string) => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
};

export const useStripeSetupCardDismiss = () => {
  const { appBridgeState } = useAppBridge();
  const key = useMemo(
    () => storageKey(appBridgeState?.saleorApiUrl),
    [appBridgeState?.saleorApiUrl],
  );

  const [dismissed, setDismissed] = useState(() => readDismissed(key));

  /**
   * AppBridge often hydrates `saleorApiUrl` after the first paint. Re-read storage when the
   * keyed tenant changes so a dismissal for the real shop is not lost behind `:unknown`.
   */
  useEffect(() => {
    setDismissed(readDismissed(key));
  }, [key]);

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
