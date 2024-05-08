import {
  smtpConfigurationEventV2Schema,
  SmtpConfigurationV2,
  smtpConfigurationV2Schema,
  SmtpConfigV2,
  smtpConfigV2Schema,
  SmtpEventConfigurationV2,
} from "./migrations/smtp-config-schema-v2";

export const smtpEncryptionTypes = ["NONE", "TLS", "SSL"] as const;

export const smtpConfigurationEventSchema = smtpConfigurationEventV2Schema;

export type SmtpEventConfiguration = SmtpEventConfigurationV2;

export const smtpConfigurationSchema = smtpConfigurationV2Schema;

export type SmtpConfiguration = SmtpConfigurationV2;

export const smtpConfigSchema = smtpConfigV2Schema;

export type SmtpConfig = SmtpConfigV2;
