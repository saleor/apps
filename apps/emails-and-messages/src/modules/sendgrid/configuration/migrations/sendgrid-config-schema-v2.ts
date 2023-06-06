import { z } from "zod";
import { messageEventTypes } from "../../../event-handlers/message-event-types";
import { channelConfigurationSchema } from "../../../channels/channel-configuration-schema";

export const sendgridConfigurationEventV2Schema = z.object({
  active: z.boolean().default(false),
  eventType: z.enum(messageEventTypes),
  template: z.string().optional(),
});

export type SendgridEventConfigurationV2 = z.infer<typeof sendgridConfigurationEventV2Schema>;

export const sendgridConfigurationV2Schema = z.object({
  id: z.string().min(1),
  active: z.boolean().default(true),
  name: z.string().min(1),
  sandboxMode: z.boolean().default(false),
  apiKey: z.string().min(1),
  sender: z.string().min(1).optional(),
  senderEmail: z.string().email().optional(),
  senderName: z.string().optional(),
  channels: channelConfigurationSchema,
  events: z.array(sendgridConfigurationEventV2Schema),
});

export type SendgridConfigurationV2 = z.infer<typeof sendgridConfigurationV2Schema>;

export const sendgridConfigV2Schema = z.object({
  configurations: z.array(sendgridConfigurationV2Schema),
});

export type SendgridConfigV2 = z.infer<typeof sendgridConfigV2Schema>;
