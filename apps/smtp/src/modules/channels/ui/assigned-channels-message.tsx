import { Text } from "@saleor/macaw-ui";

import { ChannelConfiguration } from "../channel-configuration-schema";

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
        Configuration will be used with{" "}
        <Text size={4} fontWeight="bold">
          {" "}
          all
        </Text>{" "}
        channels.
      </Text>
    );
  }

  if (mode === "exclude") {
    const leftChannels = availableChannels.filter((channel) => !channels.includes(channel));

    if (!leftChannels.length) {
      return (
        <Text size={4} fontWeight="bold">
          Theres no channel which will be used with this configuration.
        </Text>
      );
    }
    return (
      <Text>
        Configuration will be used with channels:{" "}
        <Text size={4} fontWeight="bold">
          {leftChannels.join(", ")}
        </Text>
        .
      </Text>
    );
  }

  if (channels.length === 0) {
    return (
      <Text>
        <Text size={4} fontWeight="bold">
          No channels assigned. The configuration will not be used!
        </Text>
      </Text>
    );
  }
  return (
    <Text>
      Configuration will be used with channels:{" "}
      <Text size={4} fontWeight="bold">
        {channels.join(", ")}
      </Text>
      .
    </Text>
  );
};
