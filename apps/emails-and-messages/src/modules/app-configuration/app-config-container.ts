import { AppConfig, AppConfigurationPerChannel } from "./app-config";

export const getDefaultEmptyAppConfiguration = (): AppConfigurationPerChannel => ({
  active: false,
  mjmlConfigurationId: undefined,
  sendgridConfigurationId: undefined,
});

const getChannelAppConfiguration =
  (appConfig: AppConfig | null | undefined) => (channelSlug: string) => {
    try {
      return appConfig?.configurationsPerChannel[channelSlug] ?? null;
    } catch (e) {
      return null;
    }
  };

const setChannelAppConfiguration =
  (appConfig: AppConfig | null | undefined) =>
  (channelSlug: string) =>
  (appConfiguration: AppConfigurationPerChannel) => {
    const appConfigNormalized = structuredClone(appConfig) ?? { configurationsPerChannel: {} };

    appConfigNormalized.configurationsPerChannel[channelSlug] ??= getDefaultEmptyAppConfiguration();
    appConfigNormalized.configurationsPerChannel[channelSlug] = appConfiguration;

    return appConfigNormalized;
  };

export const AppConfigContainer = {
  getChannelAppConfiguration,
  setChannelAppConfiguration,
};
