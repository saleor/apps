import {
  smtpConfigurationEventSchema,
  SmtpConfiguration,
  smtpConfigurationSchema,
  SmtpConfig,
  smtpConfigSchema,
  SmtpEventConfigurationV2,
} from "./smtp-config-schema-v2";

export const smtpEncryptionTypes = ["NONE", "TLS", "SSL"] as const;

export const smtpConfigurationEventSchema = smtpConfigurationEventSchema;

export type SmtpEventConfiguration = SmtpEventConfigurationV2;

export const smtpConfigurationSchema = smtpConfigurationSchema;

export type SmtpConfiguration = SmtpConfiguration;

export const smtpConfigSchema = smtpConfigSchema;

export type SmtpConfig = SmtpConfig;
