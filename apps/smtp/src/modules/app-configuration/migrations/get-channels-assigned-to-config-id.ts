import { ChannelConfiguration } from "../../channels/channel-configuration-schema";
import { AppConfig } from "../app-config-schema";

export const getChannelsAssignedToConfigId = (
  configId: string,
  appConfig?: AppConfig,
): ChannelConfiguration => {
  if (!appConfig) {
    return {
      channels: [],
      mode: "restrict",
      override: true,
    };
  }

  const channels = [];

  for (const key in appConfig.configurationsPerChannel) {
    if (appConfig.configurationsPerChannel[key].mjmlConfigurationId === configId) {
      channels.push(key);
    }
  }

  return {
    channels,
    mode: "restrict",
    override: true,
  };
};
