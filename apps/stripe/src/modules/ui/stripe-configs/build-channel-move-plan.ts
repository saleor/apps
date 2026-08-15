import { type ConfigChannelFragment } from "@/generated/graphql";
import {
  StripeFrontendConfig,
  type StripeFrontendConfigSerializedFields,
} from "@/modules/app-config/domain/stripe-config";
import { type StripeEnv } from "@/modules/stripe/stripe-env";

import { type ChannelMapping } from "./build-channel-assignment-updates";

export type ChannelMove = {
  channelId: string;
  channelName: string;
  fromConfigName: string;
  fromEnv: StripeEnv;
  /** True when the channel swaps sandbox keys for live ones, or the other way around. */
  changesEnv: boolean;
};

const envOf = (config: StripeFrontendConfigSerializedFields): StripeEnv =>
  StripeFrontendConfig.createFromSerializedFields(config).getStripeEnvValue();

/**
 * Channels that would be taken away from another configuration by the current selection.
 *
 * A channel maps to at most one configuration, so assigning it here silently unassigns it
 * there — the UI has to say so before saving, and ask when the move also swaps sandbox keys
 * for live ones.
 */
export const buildChannelMovePlan = ({
  channels,
  mapping,
  targetConfig,
  selectedChannelIds,
}: {
  channels: ConfigChannelFragment[];
  mapping: ChannelMapping;
  targetConfig: StripeFrontendConfigSerializedFields;
  selectedChannelIds: Set<string>;
}): ChannelMove[] => {
  const targetEnv = envOf(targetConfig);

  return channels.flatMap((channel) => {
    if (!selectedChannelIds.has(channel.id)) {
      return [];
    }

    const currentConfig = mapping[channel.id];

    if (!currentConfig || currentConfig.id === targetConfig.id) {
      return [];
    }

    const fromEnv = envOf(currentConfig);

    return [
      {
        channelId: channel.id,
        channelName: channel.name,
        fromConfigName: currentConfig.name,
        fromEnv,
        changesEnv: fromEnv !== targetEnv,
      },
    ];
  });
};
