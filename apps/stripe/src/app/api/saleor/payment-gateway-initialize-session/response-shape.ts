import { z } from "zod";

export const PaymentGatewayInitializeResponseShape = z.object({
  stripePublishableKey: z.string(),
});

export type PaymentGatewayInitializeResponseShapeType = z.infer<
  typeof PaymentGatewayInitializeResponseShape
>;
