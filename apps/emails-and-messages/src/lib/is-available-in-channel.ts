import { SendgridConfigurationChannels } from "../modules/sendgrid/configuration/sendgrid-config-schema";

interface IsAvailableInChannelArgs {
  channel: string;
  channelConfiguration: SendgridConfigurationChannels;
}

/**
 * Returns true if the channel is available for the configuration.
 *
 * Is available if:
 * - it's not in the excluded list
 * - if assigned list is not empty, it's in the assigned list
 * - assigned list is empty
 */
export const isAvailableInChannel = ({
  channel,
  channelConfiguration,
}: IsAvailableInChannelArgs): boolean => {
  if (!channelConfiguration.override) {
    return true;
  }
  if (channelConfiguration.mode === "restrict") {
    return channel in channelConfiguration.channels;
  }
  return !(channel in channelConfiguration.channels);
};
