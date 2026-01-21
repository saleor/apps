import { z } from "zod";

import { channelConfigurationSchema } from "../../channels/channel-configuration-schema";
import { messageEventTypes } from "../../event-handlers/message-event-types";

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
  useSaleorSmtpFallback: z.boolean().default(true),
});

export type SmtpConfig = z.infer<typeof smtpConfigSchema>;

export const fallbackSmtpConfigSchema = z.object({
  smtpHost: z.string().min(1),
  smtpPort: z.string().min(1),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  encryption: z.enum(smtpEncryptionTypes).default("NONE"),
});

export const getFallbackSmtpConfigSchema = () => {
  try {
    return fallbackSmtpConfigSchema.parse({
      smtpHost: process.env.FALLBACK_SMTP_HOST,
      smtpPort: process.env.FALLBACK_SMTP_PORT,
      smtpUser: process.env.FALLBACK_SMTP_USER,
      smtpPassword: process.env.FALLBACK_SMTP_PASSWORD,
      encryption: process.env.FALLBACK_SMTP_ENCRYPTION,
    });
  } catch (_e) {
    return null;
  }
};
