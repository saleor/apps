import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { AppConfigurationFields } from "./configuration";

/**
 * Before single-key configuration was introduced, this was a shape of settings.
 */
export const fetchLegacyConfiguration = async (
  settingsManager: SettingsManager,
  domain: string,
): Promise<AppConfigurationFields | null> => {
  const host = await settingsManager.get("host", domain);
  const protocol = await settingsManager.get("protocol", domain);
  const apiKey = await settingsManager.get("apiKey", domain);
  const port = await settingsManager.get("port", domain);
  const connectionTimeoutSeconds = await settingsManager.get("connectionTimeoutSeconds", domain);

  if (host && protocol && apiKey && port && connectionTimeoutSeconds) {
    return {
      host,
      protocol,
      apiKey,
      port: parseInt(port, 10),
      connectionTimeoutSeconds: parseInt(connectionTimeoutSeconds, 10),
    };
  }

  return null;
};
