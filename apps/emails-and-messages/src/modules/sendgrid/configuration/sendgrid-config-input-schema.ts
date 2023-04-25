import { z } from "zod";
import { messageEventTypes } from "../../event-handlers/message-event-types";

export const sendgridConfigurationEventObjectSchema = z.object({
  active: z.boolean(),
  eventType: z.enum(messageEventTypes),
  template: z.string(),
});

export const sendgridConfigurationBaseObjectSchema = z.object({
  active: z.boolean(),
  configurationName: z.string().min(1),
  sandboxMode: z.boolean(),
  apiKey: z.string().min(1),
  senderName: z.string().min(1).optional(),
  senderEmail: z.string().email().min(5).optional(),
  channels: z.object({
    excludedFrom: z.array(z.string()),
    restrictedTo: z.array(z.string()),
  }),
});

export const sendgridCreateConfigurationSchema = sendgridConfigurationBaseObjectSchema.pick({
  configurationName: true,
  apiKey: true,
});

export type SendgridCreateConfigurationSchemaType = z.infer<
  typeof sendgridCreateConfigurationSchema
>;

export const sendgridUpdateOrCreateConfigurationSchema =
  sendgridConfigurationBaseObjectSchema.merge(
    z.object({
      id: z.string().optional(),
    })
  );
export const sendgridGetConfigurationInputSchema = z.object({
  id: z.string(),
});
export const sendgridDeleteConfigurationInputSchema = z.object({
  id: z.string(),
});
export const sendgridGetConfigurationsInputSchema = z
  .object({
    ids: z.array(z.string()).optional(),
    active: z.boolean().optional(),
  })
  .optional();

export const sendgridUpdateEventConfigurationInputSchema = z
  .object({
    configurationId: z.string(),
  })
  .merge(sendgridConfigurationEventObjectSchema);

export const sendgridGetEventConfigurationInputSchema = z.object({
  configurationId: z.string(),
  eventType: z.enum(messageEventTypes),
});

export const sendgridUpdateBasicInformationSchema = sendgridConfigurationBaseObjectSchema
  .pick({
    configurationName: true,
    active: true,
  })
  .merge(z.object({ id: z.string() }));
