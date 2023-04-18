import { useEffect, useState } from "react";
import { SALEOR_API_URL_HEADER, SALEOR_AUTHORIZATION_BEARER_HEADER } from "@saleor/app-sdk/const";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";

const getCurrentTime = () => new Date().toLocaleTimeString();

export interface ProviderInstancePingStatus {
  providerInstanceId: string;
  success: boolean;
  time: string;
}

export interface PingProviderInstanceOpts {
  result: ProviderInstancePingStatus | null;
  refresh: () => void;
}

export const usePingProviderInstance = (providerInstanceId: string | null) => {
  const { appBridgeState } = useAppBridge();

  const [result, setResult] = useState<null | ProviderInstancePingStatus>(null);

  const ping = async (providerInstanceId: string): Promise<ProviderInstancePingStatus> => {
    try {
      const pingResponse = await fetch("/api/ping-provider-instance", {
        method: "POST",
        headers: [
          ["content-type", "application/json"],
          [SALEOR_API_URL_HEADER, appBridgeState?.saleorApiUrl!],
          [SALEOR_AUTHORIZATION_BEARER_HEADER, appBridgeState?.token!],
        ],
        body: JSON.stringify({
          providerInstanceId,
        }),
      });

      const pingResult = await pingResponse.json();

      return {
        providerInstanceId,
        success: pingResult.success,
        time: getCurrentTime(),
      };
    } catch (error) {
      console.error("useProductsVariantsSync syncFetch error", error);

      return {
        providerInstanceId,
        success: false,
        time: getCurrentTime(),
      };
    }
  };

  const refresh = () => {
    setResult(null);
    if (providerInstanceId) {
      ping(providerInstanceId).then((result) => setResult(result));
    }
  };

  useEffect(() => {
    refresh();
  }, [providerInstanceId]);

  return {
    result,
    refresh,
  };
};
