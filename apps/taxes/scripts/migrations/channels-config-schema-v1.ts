import { z } from "zod";

const addressSchema = z.object({
  country: z.string(),
  zip: z.string(),
  state: z.string(),
  city: z.string(),
  street: z.string(),
});

const channelSchema = z.object({
  providerInstanceId: z.string(),
  enabled: z.boolean(),
  address: addressSchema,
});

export type ChannelV1 = z.infer<typeof channelSchema>;

const channelsV1Schema = z.record(channelSchema);

export type ChannelsV1 = z.infer<typeof channelsV1Schema>;
