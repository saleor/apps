import { z } from "zod";

import { channelConfigurationSchema } from "../../channels/channel-configuration-schema";
import { messageEventTypes } from "../../event-handlers/message-event-types";
import { smtpConfigurationEventSchema, smtpConfigurationSchema } from "./smtp-config-schema";

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

export const smtpUpdateBrandingSchema = smtpConfigurationSchema.pick({
  id: true,
  brandingSiteName: true,
  brandingLogoUrl: true,
});

export type SmtpUpdateBranding = z.infer<typeof smtpUpdateBrandingSchema>;

/**
 * Keys must be valid Handlebars identifiers so they can be referenced as
 * {{customVariables.myKey}} without needing the bracket-escape syntax.
 */
export const customVariableKeyRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * Reserved keys that must never be persisted: even though they match the identifier
 * regex, flattening them into a plain object could enable prototype pollution.
 */
export const reservedCustomVariableKeys = new Set(["__proto__", "constructor", "prototype"]);

export const smtpCustomVariableSchema = z.object({
  key: z
    .string()
    .min(1, "Key is required")
    .regex(
      customVariableKeyRegex,
      "Key must start with a letter or underscore and contain only letters, numbers and underscores",
    )
    .refine((key) => !reservedCustomVariableKeys.has(key), {
      message: `Key must not be a reserved word (${[...reservedCustomVariableKeys].join(", ")})`,
    }),
  // Empty values are allowed - they render as an empty string in the template
  value: z.string(),
});

export type SmtpCustomVariable = z.infer<typeof smtpCustomVariableSchema>;

export const smtpUpdateCustomVariablesSchema = smtpConfigurationSchema
  .pick({ id: true })
  .merge(
    z.object({
      variables: z.array(smtpCustomVariableSchema),
    }),
  )
  .superRefine((input, ctx) => {
    const seen = new Set<string>();

    input.variables.forEach((variable, index) => {
      if (seen.has(variable.key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate key: "${variable.key}". Keys must be unique.`,
          path: ["variables", index, "key"],
        });
      }

      seen.add(variable.key);
    });
  });

export type SmtpUpdateCustomVariables = z.infer<typeof smtpUpdateCustomVariablesSchema>;

export const smtpUpdateChannelsSchema = channelConfigurationSchema.merge(
  smtpConfigurationSchema.pick({
    id: true,
  }),
);

export type SmtpUpdateChannels = z.infer<typeof smtpUpdateChannelsSchema>;

export const smtpUpdateEventSchema = smtpConfigurationEventSchema.merge(
  smtpConfigurationSchema.pick({
    id: true,
  }),
);

export type SmtpUpdateEvent = z.infer<typeof smtpUpdateEventSchema>;

export const smtpGetEventConfigurationInputSchema = smtpConfigurationIdInputSchema.merge(
  z.object({
    eventType: z.enum(messageEventTypes),
  }),
);

export type SmtpGetEventConfigurationInput = z.infer<typeof smtpGetEventConfigurationInputSchema>;

export const smtpUpdateEventConfigurationInputSchema = smtpConfigurationIdInputSchema.merge(
  smtpConfigurationEventSchema,
);

export type SmtpUpdateEventConfigurationInput = z.infer<
  typeof smtpUpdateEventConfigurationInputSchema
>;

export const smtpUpdateEventArraySchema = z.object({
  configurationId: z.string(),
  events: z.array(smtpConfigurationEventSchema),
});

export type SmtpUpdateEventArray = z.infer<typeof smtpUpdateEventArraySchema>;
