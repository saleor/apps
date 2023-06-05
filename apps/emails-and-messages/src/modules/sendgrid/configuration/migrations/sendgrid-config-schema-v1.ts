import { z } from "zod";
import { messageEventTypes } from "../../../event-handlers/message-event-types";

export const sendgridEventConfigurationV1Schema = z.object({
  active: z.boolean().default(false),
  eventType: z.enum(messageEventTypes),
  template: z.string().optional(),
});

export type SendgridEventConfigurationV1 = z.infer<typeof sendgridEventConfigurationV1Schema>;

export const sendgridConfigurationV1Schema = z.object({
  id: z.string().min(1),
  active: z.boolean().default(true),
  configurationName: z.string().min(1),
  sandboxMode: z.boolean().default(false),
  senderName: z.string().optional(),
  senderEmail: z.string().optional(),
  apiKey: z.string().min(1),
  events: z.array(sendgridEventConfigurationV1Schema),
});

export type SendgridConfigurationV1 = z.infer<typeof sendgridConfigurationV1Schema>;

export const sendgridConfigV1Schema = z.object({
  configurations: z.array(sendgridConfigurationV1Schema),
});

export type SendgridConfigV1 = z.infer<typeof sendgridConfigV1Schema>;
