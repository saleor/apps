import { type ConfigChannelFragment } from "@/generated/graphql";
import { type StripeFrontendConfigSerializedFields } from "@/modules/app-config/domain/stripe-config";

export type ChannelMapping = Record<string, StripeFrontendConfigSerializedFields>;

export type ChannelAssignmentUpdate = { channelId: string; configId: string | null };

/**
 * Diffs the channels selected on a config card against the saved mapping.
 *
 * A channel maps to at most one config, so selecting a channel owned by another
 * config re-points it here; deselecting one owned here unassigns it (`configId: null`).
 * Channels owned by other configs and left unselected are not touched.
 */
export const buildChannelAssignmentUpdates = ({
  channels,
  mapping,
  configId,
  selectedChannelIds,
}: {
  channels: ConfigChannelFragment[];
  mapping: ChannelMapping;
  configId: string;
  selectedChannelIds: Set<string>;
}): ChannelAssignmentUpdate[] => {
  const updates: ChannelAssignmentUpdate[] = [];

  for (const channel of channels) {
    const assignedHere = mapping[channel.id]?.id === configId;
    const willBeAssignedHere = selectedChannelIds.has(channel.id);

    if (willBeAssignedHere && !assignedHere) {
      updates.push({ channelId: channel.id, configId });
    } else if (!willBeAssignedHere && assignedHere) {
      updates.push({ channelId: channel.id, configId: null });
    }
  }

  return updates;
};
