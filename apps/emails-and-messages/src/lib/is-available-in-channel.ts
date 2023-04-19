interface IsAvailableInChannelArgs {
  channel: string;
  restrictedToChannels: string[];
  excludedChannels: string[];
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
  restrictedToChannels,
  excludedChannels,
}: IsAvailableInChannelArgs): boolean => {
  if (channel in excludedChannels) {
    return false;
  }
  if (restrictedToChannels.length > 0 && !(channel in restrictedToChannels)) {
    return false;
  }
  return true;
};
