import { z } from "zod";
import { messageEventTypes } from "../../event-handlers/message-event-types";
import { channelConfigurationSchema } from "../../channels/channel-configuration-schema";

export const smtpEncryptionTypes = ["NONE", "TLS", "SSL"] as const;
export type SmtpEncryptionType = (typeof smtpEncryptionTypes)[number];

export const smtpConfigurationEventSchema = z.object({
  active: z.boolean().default(false),
  eventType: z.enum(messageEventTypes),
  template: z.string(),
  subject: z.string(),
});

export type SmtpEventConfiguration = z.infer<typeof smtpConfigurationEventSchema>;

export const smtpConfigurationSchema = z.object({
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
  events: z.array(smtpConfigurationEventSchema),
});

export type SmtpConfiguration = z.infer<typeof smtpConfigurationSchema>;

export const smtpConfigSchema = z.object({
  configurations: z.array(smtpConfigurationSchema),
});

export type SmtpConfig = z.infer<typeof smtpConfigSchema>;
