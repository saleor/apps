import { ChannelFragment } from "../../../generated/graphql";
import { ChannelsConfig } from "./channel-config";

export class ChannelConfigurationMerger {
  merge(channels: ChannelFragment[], channelsConfig: ChannelsConfig): ChannelsConfig {
    return channels.map((channel) => {
      const channelConfig = channelsConfig.find((c) => c.config.slug === channel.slug);

      return {
        id: channel.id,
        config: {
          providerConnectionId: channelConfig?.config.providerConnectionId ?? null,
          slug: channel.slug,
        },
      };
    });
  }
}
