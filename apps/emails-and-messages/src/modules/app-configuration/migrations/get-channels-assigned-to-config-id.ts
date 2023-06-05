import { ChannelConfiguration } from "../../channels/channel-configuration-schema";
import { AppConfig } from "../app-config-schema";

export const getChannelsAssignedToConfigId = (
  configId: string,
  moduleName: "sendgrid" | "mjml",
  appConfig?: AppConfig
): ChannelConfiguration => {
  if (!appConfig) {
    return {
      channels: [],
      mode: "restrict",
      override: true,
    };
  }

  const channels = [];

  if (moduleName === "sendgrid") {
    for (const key in appConfig.configurationsPerChannel) {
      if (appConfig.configurationsPerChannel[key].sendgridConfigurationId === configId) {
        channels.push(key);
      }
    }
  } else {
    for (const key in appConfig.configurationsPerChannel) {
      if (appConfig.configurationsPerChannel[key].mjmlConfigurationId === configId) {
        channels.push(key);
      }
    }
  }
  return {
    channels,
    mode: "restrict",
    override: true,
  };
};
