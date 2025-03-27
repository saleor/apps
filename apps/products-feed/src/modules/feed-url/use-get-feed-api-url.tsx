import { useAppBridge } from "@saleor/app-sdk/app-bridge";

export const useGetFeedApiUrl = (channelSlug: string) => {
  const { appBridgeState } = useAppBridge();

  if (!appBridgeState || !window.location.origin) {
    return null;
  }

  return `${window.location.origin}/api/feed/${encodeURIComponent(
    appBridgeState.saleorApiUrl as string,
  )}/${channelSlug}/google.xml`;
};
