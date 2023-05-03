import { z } from "zod";
import { messageEventTypes } from "../../event-handlers/message-event-types";
import { smtpEncryptionTypes } from "./mjml-config";
import { mjmlConfigurationSchema } from "./mjml-config-schema";

export const mjmlCreateConfigurationInputSchema = mjmlConfigurationSchema.pick({
  name: true,
  smtpHost: true,
  smtpPort: true,
  smtpUser: true,
  smtpPassword: true,
  encryption: true,
});

export type MjmlCreateConfigurationInput = z.infer<typeof mjmlCreateConfigurationInputSchema>;

export const mjmlConfigurationIdInputSchema = mjmlConfigurationSchema.pick({
  id: true,
});

export type MjmlGetConfigurationIdInput = z.infer<typeof mjmlConfigurationIdInputSchema>;

export const mjmlGetConfigurationsInputSchema = z
  .object({
    ids: z.array(z.string()).optional(),
    active: z.boolean().optional(),
  })
  .optional();

export type MjmlGetConfigurationsInput = z.infer<typeof mjmlGetConfigurationsInputSchema>;

export const mjmlUpdateBasicInformationSchema = mjmlConfigurationSchema.pick({
  id: true,
  name: true,
  active: true,
});

export type MjmlUpdateBasicInformation = z.infer<typeof mjmlUpdateBasicInformationSchema>;
