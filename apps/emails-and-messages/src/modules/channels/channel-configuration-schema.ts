import { z } from "zod";

export const channelMode = ["exclude", "restrict"] as const;

export const channelConfigurationSchema = z.object({
  override: z.boolean().default(false),
  channels: z.array(z.string()).default([]),
  mode: z.enum(channelMode).default("restrict"),
});

export type ChannelConfiguration = z.infer<typeof channelConfigurationSchema>;
