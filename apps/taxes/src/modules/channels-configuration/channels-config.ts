import { z } from "zod";
import { ChannelFragment } from "../../../generated/graphql";

export const channelSchema = z.object({
  providerInstanceId: z.string(),
});
export type ChannelConfig = z.infer<typeof channelSchema>;

export const channelsSchema = z.record(channelSchema);
export type ChannelsConfig = z.infer<typeof channelsSchema>;

export const defaultChannelConfig: ChannelConfig = {
  providerInstanceId: "",
};

export const createDefaultChannelsConfig = (channels: ChannelFragment[]): ChannelsConfig => {
  return channels.reduce(
    (prev, next) => ({
      ...prev,
      [next.slug]: {
        ...defaultChannelConfig,
      },
    }),
    {} as ChannelsConfig
  );
};
