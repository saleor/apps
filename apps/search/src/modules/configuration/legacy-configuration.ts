import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { AppConfigurationFields } from "./configuration";

/**
 * Before single-key configuration was introduced, this was a shape of settings.
 */
export const fetchLegacyConfiguration = async (
  settingsManager: SettingsManager,
  domain: string,
): Promise<AppConfigurationFields | null> => {
  const secretKey = await settingsManager.get("secretKey", domain);
  const appId = await settingsManager.get("appId", domain);
  const indexNamePrefix = await settingsManager.get("indexNamePrefix", domain);

  if (secretKey && appId) {
    return {
      appId,
      secretKey,
      indexNamePrefix,
    };
  }

  return null;
};
