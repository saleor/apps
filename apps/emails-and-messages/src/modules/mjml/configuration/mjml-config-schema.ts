import { z } from "zod";
import { messageEventTypes } from "../../event-handlers/message-event-types";
import { smtpEncryptionTypes } from "./mjml-config";

export const mjmlConfigurationEventSchema = z.object({
  active: z.boolean().default(false),
  eventType: z.enum(messageEventTypes),
  template: z.string(),
  subject: z.string(),
});

export type MjmlEventConfiguration = z.infer<typeof mjmlConfigurationEventSchema>;

export const mjmlConfigurationChannelsSchema = z.object({
  override: z.boolean().default(false),
  channels: z.array(z.string()).default([]),
  mode: z.enum(["exclude", "restrict"]).default("restrict"),
});

export type MjmlConfigurationChannels = z.infer<typeof mjmlConfigurationChannelsSchema>;

export const mjmlConfigurationSchema = z.object({
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
  channels: mjmlConfigurationChannelsSchema,
  events: z.array(mjmlConfigurationEventSchema),
});

export type MjmlConfiguration = z.infer<typeof mjmlConfigurationSchema>;

export const mjmlConfigSchema = z.object({
  configurations: z.array(mjmlConfigurationSchema),
});

export type MjmlConfig = z.infer<typeof mjmlConfigSchema>;
