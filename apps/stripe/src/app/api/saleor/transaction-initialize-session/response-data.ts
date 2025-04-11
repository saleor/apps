import { z } from "zod";

export const responseData = z
  .object({
    stripeClientSecret: z
      .string({
        required_error: "Client secret is required",
      })
      .min(1),
  })
  .brand("TransactionIntializeSessionResponseData");

export type ResponseDataType = z.infer<typeof responseData>;

export const stripePaymentIntentId = z
  .string({
    required_error: "Payment intent id is required",
  })
  .startsWith("pi_")
  .brand("StripePaymentIntentId");

export type StripePaymentIntentIdType = z.infer<typeof stripePaymentIntentId>;
