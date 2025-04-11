import { z } from "zod";

export const PaymentGatewayInitializeResponseDataShape = z.object({
  stripePublishableKey: z.string(),
});

export type PaymentGatewayInitializeResponseDataShapeType = z.infer<
  typeof PaymentGatewayInitializeResponseDataShape
>;
