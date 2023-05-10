import { z } from "zod";
import { messageEventTypes } from "../../event-handlers/message-event-types";
import { smtpConfigurationEventSchema, smtpConfigurationSchema } from "./mjml-config-schema";
import { channelConfigurationSchema } from "../../../lib/channel-assignment/channel-configuration-schema";

export const smtpCreateConfigurationInputSchema = smtpConfigurationSchema.pick({
  name: true,
  smtpHost: true,
  smtpPort: true,
  smtpUser: true,
  smtpPassword: true,
  encryption: true,
});

export type SmtpCreateConfigurationInput = z.infer<typeof smtpCreateConfigurationInputSchema>;

export const smtpConfigurationIdInputSchema = smtpConfigurationSchema.pick({
  id: true,
});

export type SmtpGetConfigurationIdInput = z.infer<typeof smtpConfigurationIdInputSchema>;

export const smtpGetConfigurationsInputSchema = z
  .object({
    ids: z.array(z.string()).optional(),
    active: z.boolean().optional(),
  })
  .optional();

export type SmtpGetConfigurationsInput = z.infer<typeof smtpGetConfigurationsInputSchema>;

export const smtpUpdateBasicInformationSchema = smtpConfigurationSchema.pick({
  id: true,
  name: true,
  active: true,
});

export type SmtpUpdateBasicInformation = z.infer<typeof smtpUpdateBasicInformationSchema>;

export const smtpUpdateSmtpSchema = smtpConfigurationSchema.pick({
  id: true,
  smtpHost: true,
  smtpPort: true,
  smtpPassword: true,
  smtpUser: true,
  encryption: true,
});

export type SmtpUpdateSmtp = z.infer<typeof smtpUpdateSmtpSchema>;

export const smtpUpdateSenderSchema = smtpConfigurationSchema.pick({
  id: true,
  senderEmail: true,
  senderName: true,
});

export type SmtpUpdateSender = z.infer<typeof smtpUpdateSenderSchema>;

export const smtpUpdateChannelsSchema = channelConfigurationSchema.merge(
  smtpConfigurationSchema.pick({
    id: true,
  })
);

export type SmtpUpdateChannels = z.infer<typeof smtpUpdateChannelsSchema>;

export const smtpUpdateEventSchema = smtpConfigurationEventSchema.merge(
  smtpConfigurationSchema.pick({
    id: true,
  })
);

export type SmtpUpdateEvent = z.infer<typeof smtpUpdateEventSchema>;

export const smtpGetEventConfigurationInputSchema = smtpConfigurationIdInputSchema.merge(
  z.object({
    eventType: z.enum(messageEventTypes),
  })
);

export type SmtpGetEventConfigurationInput = z.infer<typeof smtpGetEventConfigurationInputSchema>;
