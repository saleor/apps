import {
  SmtpConfigV2,
  SmtpConfigurationV2,
  SmtpEventConfigurationV2,
  smtpConfigV2Schema,
  smtpConfigurationEventV2Schema,
  smtpConfigurationV2Schema,
} from "./migrations/smtp-config-schema-v2";

export const smtpEncryptionTypes = ["NONE", "TLS", "SSL"] as const;

export const smtpConfigurationEventSchema = smtpConfigurationEventV2Schema;

export type SmtpEventConfiguration = SmtpEventConfigurationV2;

export const smtpConfigurationSchema = smtpConfigurationV2Schema;

export type SmtpConfiguration = SmtpConfigurationV2;

export const smtpConfigSchema = smtpConfigV2Schema;

export type SmtpConfig = SmtpConfigV2;
