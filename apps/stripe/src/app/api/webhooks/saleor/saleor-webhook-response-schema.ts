import { z, ZodTypeAny } from "zod";

export const createSuccessWebhookResponseDataSchema = (schema: ZodTypeAny) =>
  z.object({
    paymentIntent: schema,
  });

export const createFailureWebhookResponseDataSchema = (errorsSchema: ZodTypeAny) =>
  createSuccessWebhookResponseDataSchema(
    z.object({
      errors: errorsSchema,
    }),
  );
