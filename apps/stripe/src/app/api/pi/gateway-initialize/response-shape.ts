import { z } from "zod";

export const PaymentGatewayInitializeResponseShape = z.object({
  stripePk: z.string(),
});

export type PaymentGatewayInitializeResponseShapeType = z.infer<
  typeof PaymentGatewayInitializeResponseShape
>;
