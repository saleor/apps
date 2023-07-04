import { z } from "zod";
import { messageEventTypes } from "../../event-handlers/message-event-types";
import {
  sendgridConfigurationEventSchema,
  sendgridConfigurationSchema,
} from "./sendgrid-config-schema";
import { channelConfigurationSchema } from "../../channels/channel-configuration-schema";

export const sendgridCreateConfigurationInputSchema = sendgridConfigurationSchema.pick({
  name: true,
  apiKey: true,
});

export type SendgridCreateConfigurationInput = z.infer<
  typeof sendgridCreateConfigurationInputSchema
>;

export const sendgridConfigurationIdInputSchema = sendgridConfigurationSchema.pick({
  id: true,
});

export type SendgridGetConfigurationIdInput = z.infer<typeof sendgridConfigurationIdInputSchema>;

export const sendgridGetConfigurationsInputSchema = z
  .object({
    ids: z.array(z.string()).optional(),
    active: z.boolean().optional(),
  })
  .optional();

export type SendgridGetConfigurationsInput = z.infer<typeof sendgridGetConfigurationsInputSchema>;

export const sendgridUpdateEventConfigurationInputSchema = z
  .object({
    configurationId: z.string(),
  })
  .merge(sendgridConfigurationEventSchema);

export type SendgridUpdateEventConfigurationInput = z.infer<
  typeof sendgridUpdateEventConfigurationInputSchema
>;

export const sendgridGetEventConfigurationInputSchema = z.object({
  configurationId: z.string(),
  eventType: z.enum(messageEventTypes),
});

export type SendgridGetEventConfigurationInput = z.infer<
  typeof sendgridGetEventConfigurationInputSchema
>;

export const sendgridUpdateBasicInformationSchema = sendgridConfigurationSchema.pick({
  id: true,
  name: true,
  active: true,
});

export type SendgridUpdateBasicInformation = z.infer<typeof sendgridUpdateBasicInformationSchema>;

export const sendgridUpdateApiConnectionSchema = sendgridConfigurationSchema.pick({
  id: true,
  apiKey: true,
  sandboxMode: true,
});

export type SendgridUpdateApiConnection = z.infer<typeof sendgridUpdateApiConnectionSchema>;

export const sendgridUpdateSenderSchema = sendgridConfigurationSchema.pick({
  id: true,
  sender: true,
});
export type SendgridUpdateSender = z.infer<typeof sendgridUpdateSenderSchema>;

export const sendgridUpdateChannelsSchema = channelConfigurationSchema.merge(
  sendgridConfigurationSchema.pick({
    id: true,
  })
);

export type SendgridUpdateChannels = z.infer<typeof sendgridUpdateChannelsSchema>;

export const sendgridUpdateEventSchema = sendgridConfigurationEventSchema.merge(
  sendgridConfigurationSchema.pick({
    id: true,
  })
);

export type SendgridUpdateEvent = z.infer<typeof sendgridUpdateEventSchema>;

export const sendgridUpdateEventArraySchema = z.object({
  configurationId: z.string(),
  events: z
    .array(sendgridConfigurationEventSchema)
    /*
     * Pass the validation if all the events are in one of two states:
     * 1. Inactive
     * 2. Active and have a template
     */
    .refine(
      (data) => data.every((event) => event.active === false || (event.active && event.template)),
      {
        message: "All active events must have assigned template.",
      }
    ),
});

export type SendgridUpdateEventArray = z.infer<typeof sendgridUpdateEventArraySchema>;
