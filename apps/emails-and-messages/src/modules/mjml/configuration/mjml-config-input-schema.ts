import { z } from "zod";
import { messageEventTypes } from "../../event-handlers/message-event-types";
import { smtpEncryptionTypes } from "./mjml-config";

export const mjmlConfigurationEventObjectSchema = z.object({
  active: z.boolean(),
  eventType: z.enum(messageEventTypes),
  template: z.string().min(1),
  subject: z.string().min(1),
});

export const mjmlConfigurationBaseObjectSchema = z.object({
  active: z.boolean(),
  configurationName: z.string().min(1),
  senderName: z.string().min(1),
  senderEmail: z.string().email().min(5),
  smtpHost: z.string().min(1),
  smtpPort: z.string(),
  smtpUser: z.string(),
  smtpPassword: z.string(),
  encryption: z.enum(smtpEncryptionTypes),
});

export const mjmlCreateConfigurationSchema = mjmlConfigurationBaseObjectSchema;
export const mjmlUpdateOrCreateConfigurationSchema = mjmlConfigurationBaseObjectSchema.merge(
  z.object({
    id: z.string().optional(),
  })
);
export const mjmlGetConfigurationInputSchema = z.object({
  id: z.string(),
});
export const mjmlDeleteConfigurationInputSchema = z.object({
  id: z.string(),
});
export const mjmlGetConfigurationsInputSchema = z
  .object({
    ids: z.array(z.string()).optional(),
    active: z.boolean().optional(),
  })
  .optional();

export const mjmlUpdateEventConfigurationInputSchema = z
  .object({
    configurationId: z.string(),
  })
  .merge(mjmlConfigurationEventObjectSchema);

export const mjmlGetEventConfigurationInputSchema = z.object({
  configurationId: z.string(),
  eventType: z.enum(messageEventTypes),
});
