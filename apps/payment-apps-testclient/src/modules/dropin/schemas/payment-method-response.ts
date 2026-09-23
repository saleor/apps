import { z } from "zod";

export const PaymentMethodsResponseSchema = z.object({
  paymentMethods: z.array(
    z.discriminatedUnion("type", [
      z.object({
        type: z.literal("paypal"),
        name: z.string(),
        configuration: z.object({
          merchantId: z.string().optional(),
          intent: z.enum(["sale", "capture", "authorize", "order", "tokenize"]),
        }),
      }),
      z.object({
        type: z.literal("afterpaytouch"),
        name: z.string(),
      }),
      z.object({
        type: z.literal("scheme"),
        name: z.string(),
        brands: z.array(z.string()),
      }),
      z.object({
        type: z.literal("applepay"),
        name: z.string(),
        brands: z.array(z.string()),
      }),
      z.object({
        type: z.literal("giftcard"),
        name: z.string(),
        brand: z.string(),
      }),
      z.object({
        type: z.literal("klarna"),
        name: z.string(),
      }),
      z.object({
        type: z.literal("klarna_account"),
        name: z.string(),
      }),
      z.object({
        type: z.literal("klarna_paynow"),
        name: z.string(),
      }),
      z.object({
        type: z.literal("paysafecard"),
        name: z.string(),
      }),
      z.object({
        type: z.literal("blik"),
        name: z.string(),
      }),
      z.object({
        type: z.literal("swish"),
        name: z.string(),
      }),
      z.object({
        type: z.literal("trustly"),
        name: z.string(),
      }),
    ]),
  ),
});
