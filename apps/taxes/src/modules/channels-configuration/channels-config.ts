import { z } from "zod";
import { ChannelFragment } from "../../../generated/graphql";

const addressSchema = z.object({
  country: z.string(),
  zip: z.string(),
  state: z.string(),
  city: z.string(),
  street: z.string(),
});

export type ChannelAddress = z.infer<typeof addressSchema>;

export const channelSchema = z.object({
  providerInstanceId: z.string(),
  enabled: z.boolean(),
  address: addressSchema,
});
export type ChannelConfig = z.infer<typeof channelSchema>;

export const channelsSchema = z.record(channelSchema);
export type ChannelsConfig = z.infer<typeof channelsSchema>;

export const defaultChannelConfig: ChannelConfig = {
  providerInstanceId: "",
  address: {
    city: "",
    country: "",
    state: "",
    street: "",
    zip: "",
  },
  enabled: false,
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
