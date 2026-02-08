import { z } from "zod";

import { env } from "../../../env";
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
  // Email branding - displayed in email header and footer
  brandingSiteName: z.string().optional(),
  brandingLogoUrl: z.string().url().optional().or(z.literal("")),
});

export type SmtpConfiguration = z.infer<typeof smtpConfigurationSchema>;

export const smtpConfigSchema = z.object({
  configurations: z.array(smtpConfigurationSchema),
  useSaleorSmtpFallback: z.boolean().default(false),
});

export type SmtpConfig = z.infer<typeof smtpConfigSchema>;

// Values are duplicated in env.ts, but here they are not optional
export const fallbackSmtpConfigSchema = z.object({
  smtpHost: z.string().min(1),
  smtpPort: z.string().min(1),
  smtpUser: z.string(),
  smtpPassword: z.string(),
  encryption: z.enum(smtpEncryptionTypes).default("NONE"),
  senderName: z.string().min(1),
  senderEmail: z.string().email().min(5),
});

export type FallbackSmtpConfig = z.infer<typeof fallbackSmtpConfigSchema>;

export const getFallbackSmtpConfigSchema = (): FallbackSmtpConfig | null => {
  // In t3-env we can only assign primitives, so we need another layer to verify if all-or-nothing is set
  try {
    return fallbackSmtpConfigSchema.parse({
      smtpHost: env.FALLBACK_SMTP_HOST,
      smtpPort: env.FALLBACK_SMTP_PORT,
      smtpUser: env.FALLBACK_SMTP_USER,
      smtpPassword: env.FALLBACK_SMTP_PASSWORD,
      encryption: env.FALLBACK_SMTP_ENCRYPTION,
      senderName: env.FALLBACK_SMTP_SENDER_NAME,
      senderEmail: env.FALLBACK_SMTP_SENDER_EMAIL,
    });
  } catch (_e) {
    return null;
  }
};
