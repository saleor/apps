import { z } from "zod";

export const channelSchema = z.object({
  providerInstanceId: z.string().or(z.null()),
  slug: z.string(),
});
export type ChannelConfig = z.infer<typeof channelSchema>;

export const channelsSchema = z.array(channelSchema);
export type ChannelsConfig = z.infer<typeof channelsSchema>;
