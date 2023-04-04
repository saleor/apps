import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import React from "react";
import { CMSSchemaChannels, SingleChannelSchema } from "../../../../lib/cms/config";
import { SALEOR_API_URL_HEADER, SALEOR_AUTHORIZATION_BEARER_HEADER } from "@saleor/app-sdk/const";
import { ChannelsApiResponse } from "../../../../pages/api/channels";

export const useChannelsFetch = () => {
  const { appBridgeState } = useAppBridge();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(false);
  const [config, setConfig] = React.useState<CMSSchemaChannels | null>(null);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const getChannels = async () => {
    setIsFetching(true);

    const response = await fetch("/api/channels", {
      headers: [
        ["content-type", "application/json"],
        [SALEOR_API_URL_HEADER, appBridgeState?.saleorApiUrl!],
        [SALEOR_AUTHORIZATION_BEARER_HEADER, appBridgeState?.token!],
      ],
    }).catch((r) => {
      setIsFetching(false);
      console.error(r);

      return r;
    });

    try {
      const result = (await response.json()) as ChannelsApiResponse;
      setIsFetching(false);

      if (result.success && result.data) {
        const config = result.data;

        setConfig(config);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const saveChannel = async (config: SingleChannelSchema) => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/channels", {
        method: "POST",
        headers: [
          ["content-type", "application/json"],
          [SALEOR_API_URL_HEADER, appBridgeState?.saleorApiUrl!],
          [SALEOR_AUTHORIZATION_BEARER_HEADER, appBridgeState?.token!],
        ],
        body: JSON.stringify(config),
      });

      const result = await response.json();
      setIsSaving(false);

      console.log("saveSettings result", result);

      if (result.success && result.data) {
        const config = result.data;
        console.log("saveSettings config", config);

        setConfig(config);

        return {
          success: true,
        };
      } else {
        throw new Error();
      }
    } catch (error) {
      console.log(error);

      return {
        success: false,
      };
    }
  };

  React.useEffect(() => {
    getChannels();
  }, []);

  return { saveChannel, isSaving, data: config, isFetching, error: validationError };
};
