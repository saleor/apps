import { z } from "zod";

export const channelConfigPropertiesSchema = z.object({
  providerConnectionId: z.string().nonempty().or(z.null()),
  slug: z.string(),
});

export type ChannelConfigProperties = z.infer<typeof channelConfigPropertiesSchema>;

export const channelConfigSchema = z.object({
  id: z.string(),
  config: channelConfigPropertiesSchema,
});

export type ChannelConfig = z.infer<typeof channelConfigSchema>;

export const channelsSchema = z.array(channelConfigSchema);
export type ChannelsConfig = z.infer<typeof channelsSchema>;
