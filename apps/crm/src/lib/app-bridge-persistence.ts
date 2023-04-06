import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useEffect, useRef } from "react";

export type AppBridgeStorageState = {
  token: string;
  saleorApiUrl: string;
};

const storageKey = "app-bridge-state";

/**
 * Saves token and API url to pass them to the iframe
 */
export const AppBridgePersistence = {
  set(requiredState: AppBridgeStorageState) {
    window.sessionStorage.setItem(storageKey, JSON.stringify(requiredState));
  },
  get(): AppBridgeStorageState | null {
    const storageItem = window.sessionStorage.getItem(storageKey);

    if (!storageItem) {
      return null;
    }

    try {
      return JSON.parse(storageItem as string);
    } catch (e) {
      return null;
    }
  },
};

/**
 * Set cookie automatically each time AppBridge received token and API URL
 */
export const AppBridgeStorageSetter = () => {
  const { appBridgeState } = useAppBridge();

  useEffect(() => {
    if (appBridgeState?.saleorApiUrl && appBridgeState?.token) {
      AppBridgePersistence.set({
        token: appBridgeState.token,
        saleorApiUrl: appBridgeState.saleorApiUrl,
      });
    }
  }, [appBridgeState?.saleorApiUrl, appBridgeState?.token]);

  return null;
};

export const useAppBridgePersistence = () => {
  const value = useRef(AppBridgePersistence.get());

  return value.current;
};
