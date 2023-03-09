import { z } from "zod";

export const appConfigInputSchema = z.object({
  configurationsPerChannel: z.record(
    z.object({
      active: z.boolean(),
      mjmlConfigurationId: z.string().optional(),
      sendgridConfigurationId: z.string().optional(),
    })
  ),
});

export const appChannelConfigurationInputSchema = z.object({
  channel: z.string(),
  configuration: z.object({
    active: z.boolean(),
    mjmlConfigurationId: z.string().optional(),
    sendgridConfigurationId: z.string().optional(),
  }),
});
