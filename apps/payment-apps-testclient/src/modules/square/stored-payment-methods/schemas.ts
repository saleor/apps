import { z } from "zod";

export const storedPaymentMethodErrorSchema = z.object({
  field: z.string().nullable(),
  message: z.string().nullable(),
  code: z.string(),
});

export const StoredPaymentMethodSchema = z.object({
  id: z.string(),
  gateway: z.object({
    id: z.string(),
    name: z.string(),
  }),
  paymentMethodId: z.string(),
  creditCardInfo: z
    .object({
      brand: z.string(),
      lastDigits: z.string(),
      expMonth: z.number().nullable(),
      expYear: z.number().nullable(),
    })
    .nullable(),
  supportedPaymentFlows: z.array(z.string()).nullable(),
  type: z.string(),
  name: z.string().nullable(),
  data: z.unknown().nullable(),
});

export const SquareTokenizationConfigSchema = z.object({
  square: z.object({
    environment: z.enum(["sandbox", "production"]),
    applicationId: z.string().min(1),
    locationId: z.string().min(1),
  }),
});

export type StoredPaymentMethod = z.infer<typeof StoredPaymentMethodSchema>;
