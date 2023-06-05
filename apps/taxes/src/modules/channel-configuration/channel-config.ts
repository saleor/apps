import { z } from "zod";

export const channelSchema = z.object({
  providerInstanceId: z.string().or(z.null()),
});
export type ChannelConfig = z.infer<typeof channelSchema>;

export const channelsSchema = z.record(channelSchema);
export type ChannelsConfig = z.infer<typeof channelsSchema>;
