import { z } from "zod";
import { ChannelFragment } from "../../../../generated/graphql";

export const channelCommonSchema = z.object({
  channelSlug: z.string(),
});

export type ChannelCommonSchema = z.infer<typeof channelCommonSchema>;

export const channelSchema = z
  .object({
    enabledProviderInstances: z.array(z.string()),
  })
  .merge(channelCommonSchema);

export type ChannelSchema = z.infer<typeof channelSchema>;

export type SingleChannelSchema = ChannelSchema & ChannelCommonSchema;

export type MergedChannelSchema = SingleChannelSchema & {
  channel: ChannelFragment;
};
