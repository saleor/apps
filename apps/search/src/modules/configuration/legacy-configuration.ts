import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { AppConfigurationFields } from "./configuration";

/**
 * Before single-key configuration was introduced, this was a shape of settings.
 */
export const fetchLegacyConfiguration = async (
  settingsManager: SettingsManager,
  domain: string,
) => {
  const data: AppConfigurationFields = {
    secretKey: (await settingsManager.get("secretKey", domain)) || "",
    appId: (await settingsManager.get("appId", domain)) || "",
    indexNamePrefix: (await settingsManager.get("indexNamePrefix", domain)) || "",
  };

  return data;
};
