import {
  SendgridConfigV2,
  SendgridConfigurationV2,
  SendgridEventConfigurationV2,
  sendgridConfigV2Schema,
  sendgridConfigurationEventV2Schema,
  sendgridConfigurationV2Schema,
} from "./migrations/sendgrid-config-schema-v2";

export const sendgridConfigurationEventSchema = sendgridConfigurationEventV2Schema;

export type SendgridEventConfiguration = SendgridEventConfigurationV2;

export const sendgridConfigurationSchema = sendgridConfigurationV2Schema;

export type SendgridConfiguration = SendgridConfigurationV2;

export const sendgridConfigSchema = sendgridConfigV2Schema;

export type SendgridConfig = SendgridConfigV2;
