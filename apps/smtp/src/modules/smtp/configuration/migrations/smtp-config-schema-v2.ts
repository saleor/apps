import { z } from "zod";
import { messageEventTypes } from "../../../event-handlers/message-event-types";
import { channelConfigurationSchema } from "../../../channels/channel-configuration-schema";

export const smtpEncryptionTypes = ["NONE", "TLS", "SSL"] as const;

export const smtpConfigurationEventV2Schema = z.object({
  active: z.boolean().default(false),
  eventType: z.enum(messageEventTypes),
  template: z.string(),
  subject: z.string(),
});

export type SmtpEventConfigurationV2 = z.infer<typeof smtpConfigurationEventV2Schema>;

export const smtpConfigurationV2Schema = z.object({
  id: z.string().min(1),
  active: z.boolean().default(true),
  name: z.string().min(1),
  senderName: z.string().optional(),
  senderEmail: z.string().email().min(5).optional(),
  smtpHost: z.string().min(1),
  smtpPort: z.string().min(1),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  encryption: z.enum(smtpEncryptionTypes).default("NONE"),
  channels: channelConfigurationSchema,
  events: z.array(smtpConfigurationEventV2Schema),
});

export type SmtpConfigurationV2 = z.infer<typeof smtpConfigurationV2Schema>;

export const smtpConfigV2Schema = z.object({
  configurations: z.array(smtpConfigurationV2Schema),
});

export type SmtpConfigV2 = z.infer<typeof smtpConfigV2Schema>;
