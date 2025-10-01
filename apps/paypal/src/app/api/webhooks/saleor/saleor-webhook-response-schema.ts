import { z, ZodTypeAny } from "zod";

export const createSuccessWebhookResponseDataSchema = (schema: ZodTypeAny) =>
  z.object({
    order: schema,
  });

export const createFailureWebhookResponseDataSchema = (errorsSchema: ZodTypeAny) =>
  createSuccessWebhookResponseDataSchema(
    z.object({
      errors: errorsSchema,
    }),
  );
