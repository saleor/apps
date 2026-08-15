import {
  channelActiveToStatus,
  ChannelListItem,
  EmptyAssignCallout,
  iconSize,
  iconStrokeWidthBySize,
} from "@saleor/apps-ui-next";
import { Box, Button } from "@saleor/macaw-ui";
import { Globe } from "lucide-react";

import { type ConfigChannelFragment } from "@/generated/graphql";

type Props = {
  channels: ConfigChannelFragment[];
  /** Configuration name used in disconnect tooltip, e.g. "Disconnect Default Channel from Dev". */
  configName: string;
  disconnectDisabled?: boolean;
  onDisconnect?: (channelId: string) => void;
  /** Opens assign mode from the empty-state callout. */
  onAssign?: () => void;
  assignDisabled?: boolean;
};

/** Full-bleed channel rows for a config card, or Dashboard-style empty assign callout. */
export const ConfigCardChannelList = ({
  channels,
  configName,
  onDisconnect,
  disconnectDisabled = false,
  onAssign,
  assignDisabled = false,
}: Props) => {
  if (channels.length === 0) {
    return (
      <EmptyAssignCallout
        data-test-id="config-card-channels-empty"
        icon={<Globe size={iconSize.small} strokeWidth={iconStrokeWidthBySize.small} />}
        title="No channels assigned"
        description="This configuration won’t take payments until you assign at least one Saleor channel."
        action={
          onAssign ? (
            <Button
              variant="secondary"
              size="small"
              disabled={assignDisabled}
              onClick={onAssign}
              data-test-id="config-card-channels-empty-assign"
            >
              Assign
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <Box data-test-id="config-card-channel-list">
      {channels.map((channel, index) => (
        <ChannelListItem
          key={channel.id}
          name={channel.name}
          currencyCode={channel.currencyCode}
          statusType={channelActiveToStatus(channel.isActive)}
          showDivider={index < channels.length - 1}
          disconnectDisabled={disconnectDisabled}
          disconnectLabel={`Disconnect ${channel.name} from ${configName}`}
          onDisconnect={
            onDisconnect
              ? () => {
                  onDisconnect(channel.id);
                }
              : undefined
          }
        />
      ))}
    </Box>
  );
};
