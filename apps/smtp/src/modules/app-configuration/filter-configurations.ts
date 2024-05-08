import { ChannelConfiguration } from "../channels/channel-configuration-schema";
import { isAvailableInChannel } from "../channels/is-available-in-channel";

export interface FilterableConfiguration {
  id: string;
  active: boolean;
  channels: ChannelConfiguration;
}

interface filterConfigurationsArgs<TConfiguration extends FilterableConfiguration> {
  configurations: TConfiguration[];
  filter?: {
    ids?: string[];
    availableInChannel?: string;
    active?: boolean;
  };
}

export const filterConfigurations = <TConfiguration extends FilterableConfiguration>({
  filter,
  configurations,
}: filterConfigurationsArgs<TConfiguration>) => {
  if (!filter) {
    return configurations;
  }

  let filtered = configurations;

  if (filter.ids?.length) {
    filtered = filtered.filter((c) => filter?.ids?.includes(c.id));
  }

  if (filter.active !== undefined) {
    filtered = filtered.filter((c) => c.active === filter.active);
  }

  if (filter.availableInChannel?.length) {
    filtered = filtered.filter((c) =>
      isAvailableInChannel({
        channel: filter.availableInChannel!,
        channelConfiguration: c.channels,
      }),
    );
  }

  return filtered;
};
