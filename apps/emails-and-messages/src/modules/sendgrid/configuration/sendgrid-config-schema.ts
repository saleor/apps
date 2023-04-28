import { z } from "zod";
import { messageEventTypes } from "../../event-handlers/message-event-types";

export const sendgridConfigurationEventSchema = z.object({
  active: z.boolean().default(false),
  eventType: z.enum(messageEventTypes),
  template: z.string().optional(),
});

export type SendgridEventConfiguration = z.infer<typeof sendgridConfigurationEventSchema>;

export const sendgridConfigurationChannelsSchema = z.object({
  override: z.boolean().default(false),
  channels: z.array(z.string()).default([]),
  mode: z.enum(["exclude", "restrict"]).default("restrict"),
});

export type SendgridConfigurationChannels = z.infer<typeof sendgridConfigurationChannelsSchema>;

export const sendgridConfigurationSchema = z.object({
  id: z.string().min(1),
  active: z.boolean().default(true),
  name: z.string().min(1),
  sandboxMode: z.boolean().default(false),
  apiKey: z.string().min(1),
  sender: z.string().min(1).optional(),
  channels: sendgridConfigurationChannelsSchema,
  events: z.array(sendgridConfigurationEventSchema),
});

export type SendgridConfiguration = z.infer<typeof sendgridConfigurationSchema>;

export const sendgridConfigSchema = z.object({
  configurations: z.array(sendgridConfigurationSchema),
});

export type SendgridConfig = z.infer<typeof sendgridConfigSchema>;
