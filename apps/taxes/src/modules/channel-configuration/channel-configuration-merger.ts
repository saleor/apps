import { ChannelFragment } from "../../../generated/graphql";
import { createId } from "../../lib/utils";
import { ChannelsConfig } from "./channel-config";

export class ChannelConfigurationMerger {
  merge(channels: ChannelFragment[], channelsConfig: ChannelsConfig): ChannelsConfig {
    return channels.map((channel) => {
      const channelConfig = channelsConfig.find((c) => c.config.slug === channel.slug);

      if (!channelConfig) {
        return {
          id: createId(),
          config: {
            providerConnectionId: null,
            slug: channel.slug,
          },
        };
      }

      return {
        id: channelConfig.id,
        config: {
          providerConnectionId: channelConfig.config.providerConnectionId,
          slug: channel.slug,
        },
      };
    });
  }
}
