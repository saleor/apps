import { z } from "zod";

import { PaymentMethodsResponseSchema } from "./payment-method-response";

export const GiftCardBalanceResponseSchema = z
  .object({
    balance: z.object({
      value: z.number(),
      currency: z.string(),
    }),
  })
  .optional();
export const OrderCreateResponseSchema = z.any({}).optional();
export const OrderCancelResponseSchema = z
  .object({
    resultCode: z.string(),
  })
  .optional();

export const InitalizePaymentGatewaySchema = z.object({
  paymentGatewayInitialize: z.object({
    gatewayConfigs: z.array(
      z.object({
        id: z.string(),
        data: z.object({
          clientKey: z.string().optional(),
          environment: z.string().optional(),
          paymentMethodsResponse: PaymentMethodsResponseSchema.optional(),
          giftCardBalanceResponse: GiftCardBalanceResponseSchema,
          orderCreateResponse: OrderCreateResponseSchema,
          orderCancelResponse: OrderCancelResponseSchema,
        }),
        errors: z.array(
          z.object({
            field: z.string(),
            message: z.string(),
            code: z.string(),
          }),
        ),
      }),
    ),
    errors: z.array(
      z.object({
        field: z.string(),
        message: z.string(),
        code: z.string(),
      }),
    ),
  }),
});

export type InitalizePaymentGatewaySchemaType = z.infer<typeof InitalizePaymentGatewaySchema>;
