import { captureMessage } from "@sentry/nextjs";
import { z } from "zod";

const StripeRefundIdSchema = z
  .string()
  .refine((v) => {
    const expectedPrefix = [
      // Standard Stripe refund
      "re_",
      // Refund for an external system like PayPal
      "pyr_",
    ];

    if (!expectedPrefix.some((prefix) => v.startsWith(prefix))) {
      captureMessage("Received unexpected Stripe Refund ID format", (scope) => {
        scope.setLevel("warning");
        scope.setExtra("stripeRefundId", v);

        return scope;
      });
    }

    return true;
  })
  .brand("StripeRefundId");

export const createStripeRefundId = (raw: string) => StripeRefundIdSchema.parse(raw);

export type StripeRefundId = z.infer<typeof StripeRefundIdSchema>;
