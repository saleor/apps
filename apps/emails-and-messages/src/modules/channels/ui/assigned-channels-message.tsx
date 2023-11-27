import { ChannelConfiguration } from "../channel-configuration-schema";
import { Text } from "@saleor/macaw-ui";

interface OverrideMessageArgs {
  availableChannels: string[];
  channelConfiguration: ChannelConfiguration;
}

export const AssignedChannelsMessage = ({
  availableChannels,
  channelConfiguration: { channels, mode, override },
}: OverrideMessageArgs) => {
  if (!override) {
    return (
      <Text>
        Configuration will be used with <Text variant="bodyStrong"> all</Text> channels.
      </Text>
    );
  }

  if (mode === "exclude") {
    const leftChannels = availableChannels.filter((channel) => !channels.includes(channel));

    if (!leftChannels.length) {
      return (
        <Text variant="bodyStrong">
          Theres no channel which will be used with this configuration.
        </Text>
      );
    }
    return (
      <Text>
        Configuration will be used with channels:{" "}
        <Text variant="bodyStrong">{leftChannels.join(", ")}</Text>.
      </Text>
    );
  }

  if (channels.length === 0) {
    return (
      <Text>
        <Text variant="bodyStrong">No channels assigned. The configuration will not be used!</Text>
      </Text>
    );
  }
  return (
    <Text>
      Configuration will be used with channels:{" "}
      <Text variant="bodyStrong">{channels.join(", ")}</Text>.
    </Text>
  );
};
