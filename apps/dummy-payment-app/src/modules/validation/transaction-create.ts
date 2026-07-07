import { z } from "zod";

/**
 * Mirrors Saleor's `CardPaymentMethodDetailsInput`.
 */
const cardPaymentMethodDetailsSchema = z.object({
  name: z.string(),
  brand: z.string().optional(),
  firstDigits: z.string().optional(),
  lastDigits: z.string().optional(),
  expMonth: z.number().int().optional(),
  expYear: z.number().int().optional(),
});

/**
 * Mirrors Saleor's `OtherPaymentMethodDetailsInput`.
 */
const otherPaymentMethodDetailsSchema = z.object({
  name: z.string(),
});

/**
 * Mirrors Saleor's `GiftCardPaymentMethodDetailsInput` (added in Saleor 3.23).
 */
const giftCardPaymentMethodDetailsSchema = z.object({
  name: z.string(),
  brand: z.string().optional(),
  lastChars: z.string().optional(),
});

/**
 * Mirrors Saleor's `PaymentMethodDetailsInput`. Saleor expects exactly one branch
 * to be set; the widget UI guarantees that, so we keep the schema permissive here.
 */
export const paymentMethodDetailsSchema = z.object({
  card: cardPaymentMethodDetailsSchema.optional(),
  other: otherPaymentMethodDetailsSchema.optional(),
  giftCard: giftCardPaymentMethodDetailsSchema.optional(),
});

export type PaymentMethodDetailsInputShape = z.infer<typeof paymentMethodDetailsSchema>;
